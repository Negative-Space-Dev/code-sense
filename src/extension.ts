// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import cors from 'cors';
import * as stringSimilarity from 'string-similarity';
import { CustomTextSearchMatch } from './types';

const app = express();
const port = (vscode.workspace.getConfiguration('code-sense').get('serverPort') || 49168) as number;
console.log('PORT', port);

app.use(cors());
app.use(express.static(path.join(__dirname, '../solid-app/dist/')));

app
  .listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  })
  .on('error', (err) => {
    vscode.window.showErrorMessage(`Code Sense: ${err.message}`);
  });

export function activate(context: vscode.ExtensionContext) {
  // Track currently webview panel
  let currentPanel: vscode.WebviewPanel | undefined = undefined;

  const disposable = vscode.commands.registerCommand('code-sense.start', async () => {
    // const fullWebServerUri = await vscode.env.asExternalUri(
    // 	vscode.Uri.parse(`http://localhost:5173`)
    // );

    // console.log(fullWebServerUri);

    if (currentPanel) return currentPanel.reveal();
    let activeEditor = vscode.window.activeTextEditor;
    let firstSet = true;

    const setActiveEditor = (editor: vscode.TextEditor | undefined) => {
      if (editor && (editor.document.fileName !== activeEditor?.document.fileName || firstSet)) {
        firstSet = false;
        activeEditor = editor;
        currentPanel?.webview.postMessage({ activeEditor: editor });
      }
    };

    // Create and show a new webview
    currentPanel = vscode.window.createWebviewPanel(
      'code-sense', // Identifies the type of the webview. Used internally
      'Code Sense', // Title of the panel displayed to the user
      {
        viewColumn: activeEditor?.viewColumn ? activeEditor?.viewColumn + 1 : vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
        preserveFocus: true,
      },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'solid-app/dist')],
      } // Webview options. More on these later.
    );

    currentPanel.iconPath = vscode.Uri.file(
      path.join(context.extensionPath, 'images/Code-Sense-Logo.png')
    );

    const entryPath = path.join(context.extensionPath, 'solid-app/dist/index.html');

    const loadEntry = () => {
      const fileBuffer = fs.readFileSync(entryPath);
      let file = fileBuffer.toString();

      const reloadedBadge = `
			<div id="reloaded-badge">Reloaded</div>
			<style>
				#reloaded-badge {
					position: fixed; 
					top: 25px; 
					right: 25px; 
					background: #5eba7d;
					color: #fff;
					font-weight: 600;
					font-size: 14px;
					padding: 5px 10px;
					border-radius: 6px;
					animation: fadeOut 1s;
					animation-delay: 2s;
					animation-fill-mode: forwards;
				}
				@keyframes fadeOut {
					0% {
						opacity: 1;
					}
					100% {
						opacity: 0;
					}
				}
			</style>
			<script> setTimeout(() => document.getElementById('reloaded-badge').remove(), 2500)</script>`;

      file = file.replace('<body>', `<body>\n${reloadedBadge}`);

      file = file.replaceAll('PORT', port.toString());

      if (currentPanel) currentPanel.webview.html = file;

      console.log('Entry loaded');
    };

    loadEntry();

    fs.watchFile(entryPath, loadEntry);

    // async function checkIfFileExists(uri: vscode.Uri) {
    //   try {
    //     // Attempt to get the file stats
    //     await vscode.workspace.fs.stat(uri);
    //     // If the stat method succeeds, the file exists
    //     console.log('The file exists.');
    //     return true;
    //   } catch (error) {
    //     // If the stat method fails, it's likely because the file does not exist
    //     console.log('The file does not exist.');
    //     return false;
    //   }
    // }

    currentPanel.webview.onDidReceiveMessage(async (message) => {
      console.log('RECEIVED MESSAGE', message);

      switch (message.command) {
        case 'find':
          let promises: Promise<void>[] = [];
          vscode.workspace
            .findTextInFiles(
              message.textSearchQuery,
              message.textSearchOptions,
              async (result) => {
                if (message.for === 'outof' && 'preview' in result) {
                  const matches = Array.from(
                    result.preview.text.matchAll(message.textSearchQuery.pattern)
                  );

                  (result as CustomTextSearchMatch).outOfUris = [];
                  promises = matches.map(async (match, index) => {
                    const filename = match.groups?.filename;
                    const extension: string =
                      match.groups?.extension ||
                      (message.fileDefinition?.extension
                        ? '.' + message.fileDefinition.extension
                        : '');
                    if (filename) {
                      const path = `${message.fileDefinition.folder}/${filename}${extension}`;
                      const uris = await vscode.workspace.findFiles(`**/${path}*`, '', 3);

                      let uri: vscode.Uri | null;
                      if (uris.length === 0 || activeEditor === undefined) uri = null;
                      else if (uris.length === 1) uri = uris[0];
                      else {
                        const activePath = activeEditor.document.uri.path;
                        uri = uris.reduce((prev, curr) => {
                          const prevScore = stringSimilarity.compareTwoStrings(
                            activePath,
                            prev.path
                          );
                          const currScore = stringSimilarity.compareTwoStrings(
                            activePath,
                            curr.path
                          );
                          return prevScore > currScore ? prev : curr;
                        });
                      }
                      (result as CustomTextSearchMatch).outOfUris[index] = uri;
                    }
                  });

                  await Promise.allSettled(promises);
                }
                currentPanel?.webview.postMessage({
                  result,
                  for: message.for,
                  activeEditor: message.activeEditor,
                });
              },
              undefined
            )
            .then(async (finalResult) => {
              await Promise.allSettled(promises);

              currentPanel?.webview.postMessage({
                result: finalResult,
                for: message.for,
                activeEditor: message.activeEditor,
                done: true,
              });
            });
          break;
        case 'openFile':
          const document = await vscode.workspace.openTextDocument(message.path);

          vscode.window.showTextDocument(document, 1).then((editor) => {
            if (message.range) {
              const range = new vscode.Range(
                message.range[0].line,
                message.range[0].character,
                message.range[1].line,
                message.range[1].character
              );
              editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
              const decorationType = vscode.window.createTextEditorDecorationType({
                border: '2px solid var(--vscode-editor-findMatchBorder)',
              });
              editor.setDecorations(decorationType, [range]);
              const disposable = vscode.window.onDidChangeTextEditorSelection(() => {
                decorationType.dispose();
                disposable.dispose();
              });
            }
          });

          // const uri = vscode.Uri.parse(message.path);
          // console.log('uri', uri);
          // try {

          // } catch (e)
          // console.log(message.path);
          // vscode.commands.executeCommand('workbench.action.quickOpen', message.path);
          break;
        case 'getWorkspace':
          currentPanel?.webview.postMessage({ workspace: vscode.workspace.workspaceFolders });
          break;
        case 'getActiveEditor':
          setActiveEditor(vscode.window.activeTextEditor);
          break;
      }
    });

    // Listens for active editor changes
    const disposable2 = vscode.window.onDidChangeActiveTextEditor((editor) =>
      setActiveEditor(editor)
    );

    currentPanel.onDidDispose(
      () => {
        currentPanel = undefined;
        fs.unwatchFile(entryPath, loadEntry);
        disposable2.dispose();
      },
      null,
      context.subscriptions
    );
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
