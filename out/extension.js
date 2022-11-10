"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
app.use(cors());
app.use(express.static(path.join(__dirname, '../solid-app/dist/')));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "code-sense" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('code-sense.find-file-references', async () => {
        console.log('Open Flow');
        // Find where the current file is being imported
        // Get current filename
        const activeTextEditor = vscode.window.activeTextEditor;
        // console.log(activeTextEditor);
        if (activeTextEditor) {
            const document = activeTextEditor.document;
            const fileNameArrayReversed = document.fileName.split('/').reverse();
            const [fileName, folderName, ...rest] = fileNameArrayReversed;
            const [fileNameRoot, fileNameExtension] = fileName.split('.');
            // console.log({fileName, folderName, fileNameRoot, fileNameExtension});
            // Perform search across workspace
            const fileNameRegex = `('|"|/)${fileNameRoot}(|.${fileNameExtension})('|")`;
            vscode.commands.executeCommand('workbench.action.findInFiles', { query: fileNameRegex, isRegex: true });
        }
    });
    let disposable2 = vscode.commands.registerCommand('code-sense.start', async () => {
        // const fullWebServerUri = await vscode.env.asExternalUri(
        // 	vscode.Uri.parse(`http://localhost:5173`)
        // );
        // console.log(fullWebServerUri);
        // Create and show a new webview
        const panel = vscode.window.createWebviewPanel('code-sense', // Identifies the type of the webview. Used internally
        'Code Sense', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(context.extensionPath),
            ]
        } // Webview options. More on these later.
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
            panel.webview.html = file;
            console.log('Entry loaded');
        };
        loadEntry();
        fs.watchFile(entryPath, (curr, prev) => loadEntry());
        panel.webview.onDidReceiveMessage(message => {
            console.log('RECEIVED MESSAGE', message);
            switch (message.command) {
                case 'find':
                    vscode.workspace.findTextInFiles({ pattern: message.text }, (result) => {
                        console.log('result', result);
                        panel.webview.postMessage({ result });
                    }, undefined).then(() => { });
                    break;
                case 'openFile':
                    const uri = vscode.Uri.parse(message.path);
                    console.log('uri', uri);
                    vscode.workspace.openTextDocument(uri).then(doc => vscode.window.showTextDocument(doc));
                    break;
            }
        });
        // const matches = file.matchAll(/(src|href)="(.*)"/g);
        // for (const match of matches) {
        // 	console.log(match);
        // 	const value = match[2];
        // 	const newValue = panel.webview.asWebviewUri(
        // 		vscode.Uri.joinPath(context.extensionUri, 'dist', value)
        // 	);
        // 	file = file.replace(value, newValue.toString());
        // }
        // const scriptUri = panel.webview.asWebviewUri(
        // 	vscode.Uri.joinPath(context.extensionUri, 'src', 'main.tsx')
        // );
        // const svgUri = panel.webview.asWebviewUri(
        // 	vscode.Uri.joinPath(context.extensionUri, 'public', 'vite.svg')
        // );
        // console.log(scriptUri);
        // console.log(svgUri);
        // const stylesUri = panel.webview.asWebviewUri(
        // 	vscode.Uri.joinPath(context.extensionUri, 'dist/assets', 'index.3fce1f81.css')
        // );
        // const cspSource = panel.webview.cspSource;
        // fetch('http://localhost:5173').then((response: any) => {
        // 	console.log('response', response);
        // 	return response.text();
        // }).then((body: any) => { 
        // 	console.log('body', body); 
        // 	// And set its HTML content
        // 	panel.webview.html = getWebviewContent(body);
        // });
        // panel.webview.html = `<!DOCTYPE html>
        // 		<head>
        // 				<meta
        // 						http-equiv="Content-Security-Policy"
        // 						content="default-src 'none'; frame-src ${fullWebServerUri} ${cspSource} https:; img-src ${cspSource} https:; script-src ${cspSource}; style-src ${cspSource} 'unsafe-inline';"
        // 				/>
        // 		</head>
        // 		<body>
        // 		<style>
        // 			html, body, iframe {
        // 				display: block;
        // 				width: 100%;
        // 				height: 100%;
        // 			}
        // 			body { padding: 0; }
        // 		</style>
        // 		<!-- All content from the web server must be in an iframe -->
        // 		<iframe src="${fullWebServerUri}" frameborder="0" allowfullscreen></iframe>
        // </body>
        // </html>`;
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
}
exports.activate = activate;
function getWebviewContent(body) {
    return body;
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map