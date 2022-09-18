// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
