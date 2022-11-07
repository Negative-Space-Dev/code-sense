// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import axios from 'axios';
import fetch from 'node-fetch';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
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
			vscode.commands.executeCommand('workbench.action.findInFiles', 
				{ query: fileNameRegex, isRegex: true });
		}
		
		vscode.workspace.findTextInFiles({pattern: 'rc-login--sanctuary-rewards-button'}, (result) => {console.log('result', result);}, undefined).then((result) => {console.log('final result', result);});

	});


	let disposable2 = vscode.commands.registerCommand('catCoding.start', async () => {
		const fullWebServerUri = await vscode.env.asExternalUri(
			vscode.Uri.parse(`http://localhost:5173`)
		);

		console.log(fullWebServerUri);
		
		// Create and show a new webview
		const panel = vscode.window.createWebviewPanel(
			'catCoding', // Identifies the type of the webview. Used internally
			'Cat Coding', // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{ 
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.file(context.extensionPath),
				]
			} // Webview options. More on these later.
		);

		const scriptUri = panel.webview.asWebviewUri(
			vscode.Uri.joinPath(context.extensionUri, 'src', 'main.tsx')
		);
		const svgUri = panel.webview.asWebviewUri(
			vscode.Uri.joinPath(context.extensionUri, 'public', 'vite.svg')
		);
		console.log(scriptUri);
		console.log(svgUri);
		const stylesUri = panel.webview.asWebviewUri(
			vscode.Uri.joinPath(context.extensionUri, 'dist/assets', 'index.3fce1f81.css')
		);

		const cspSource = panel.webview.cspSource;
		
		// fetch('http://localhost:5173').then((response: any) => {
		// 	console.log('response', response);
		// 	return response.text();
		// }).then((body: any) => { 
		// 	console.log('body', body); 
		// 	// And set its HTML content
		// 	panel.webview.html = getWebviewContent(body);
		// });

		panel.webview.html = `<!DOCTYPE html>
				<head>
						<meta
								http-equiv="Content-Security-Policy"
								content="default-src 'none'; frame-src ${fullWebServerUri} ${cspSource} https:; img-src ${cspSource} https:; script-src ${cspSource}; style-src ${cspSource} 'unsafe-inline';"
						/>
						
				</head>
				<body>
				<style>
					html, body, iframe {
						display: block;
						width: 100%;
						height: 100%;
					}

					body { padding: 0; }
				</style>
				<!-- All content from the web server must be in an iframe -->
				<iframe src="${fullWebServerUri}" frameborder="0" allowfullscreen></iframe>
		</body>
		</html>`;
	});


	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}


function getWebviewContent(body: string) {
	return body;
}

// this method is called when your extension is deactivated
export function deactivate() {}
