import * as vscode from 'vscode';
import * as path from 'path';
import { StackFrameProvider } from './StackFrameProvider';

// TODO: Viewlet for call stack
// 	stackTrace -> scopes -> variables
export function activate(context: vscode.ExtensionContext) {
	let panel: vscode.WebviewPanel | undefined = undefined;

	console.log('Congratulations, your extension "jigsaw" is now active!');

	let disposable = vscode.commands.registerCommand('jigsaw.helloWorld', () => {
		vscode.window.showInformationMessage('Hello Hello from JIGSAW!');
	});
	context.subscriptions.push(disposable);

	// TreeView
	const stackFrameProvider: StackFrameProvider = new StackFrameProvider();
	vscode.window.registerTreeDataProvider('stackFrames', stackFrameProvider);

	// DAP
	let lmao = vscode.debug.registerDebugAdapterTrackerFactory('*', {
		createDebugAdapterTracker(session: vscode.DebugSession) {
			return {
				onWillReceiveMessage(message) {
					console.log(`> ${JSON.stringify(message, undefined, 2)}`)
					panel?.webview.postMessage(message);
				},
				onDidSendMessage(message) {
					console.log(`< ${JSON.stringify(message, undefined, 2)}`)
					panel?.webview.postMessage(message);

					if (message["command"] == "variables") {
						for (var variable of message["body"]["variables"]) {
							if (variable["value"].includes("@")) {
								session.customRequest("variables", {"variablesReference": variable["variablesReference"]});
							}
						}
					}

					if (message["command"] == "stackTrace") {
						const stackFrameNames: string[] = [];
						for (var stackFrame of message["body"]["stackFrames"]) {
							stackFrameNames.push(stackFrame["name"]);
						}
						stackFrameProvider.updateStackFrameNames(stackFrameNames);
					}
				}
		  	};
		}
	  });
	context.subscriptions.push(lmao);

	// Webview
	context.subscriptions.push(
		vscode.commands.registerCommand('jigsaw.showReactFlow', () => {
		  panel = vscode.window.createWebviewPanel(
			'showReactFlow',
			'React Flow Sample View',
			vscode.ViewColumn.One,
			{
			  enableScripts: true,
			  retainContextWhenHidden: true
			}
		  );
		  panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);
		})
	  );
}

function getWebviewContent(
	webview: vscode.Webview,
	extensionUri: vscode.Uri
) {
	const scriptUri = webview.asWebviewUri(
		vscode.Uri.joinPath(
			extensionUri,
			"media",
			"main.js"
		)
	);

	const jigsawView = `<!DOCTYPE html>
			  <html lang="en">
			  <head>
				  <meta charset="UTF-8">
				  <title>Jigsaw</title>
			  </head>
			  <body>
		  <div id="root"></div>
				  <script src="${scriptUri}"></script>
			  </body>
			  </html>`;
			  
	return jigsawView;
  }

// this method is called when your extension is deactivated
export function deactivate() {}