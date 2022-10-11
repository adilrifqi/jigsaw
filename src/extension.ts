import * as vscode from 'vscode';

// TODO: Viewlet for call stack
// 	stackTrace -> scopes -> variables
export function activate(context: vscode.ExtensionContext) {
	let panel: vscode.WebviewPanel | undefined = undefined;

	console.log('Congratulations, your extension "jigsaw" is now active!');

	let disposable = vscode.commands.registerCommand('jigsaw.helloWorld', () => {
		vscode.window.showInformationMessage('Hello Hello from JIGSAW!');
	});
	context.subscriptions.push(disposable);

	// Debug Call Stack
	vscode.commands.registerCommand('stackFrames.visualizeFrame', (...args: any[]) => {
		panel?.webview.postMessage({"command": "jigsaw:visualizeFrame", "body": args[1]});
	})

	// Keep track to not requests for the first frames of stacks so as not to send duplicates
	var firstFrameId: number = -1;
	var firstFrameSeq: number = -1;

	// DAP
	let lmao = vscode.debug.registerDebugAdapterTrackerFactory('*', {
		createDebugAdapterTracker(session: vscode.DebugSession) {
			return {
				onWillReceiveMessage(message) {
					// console.log(`> ${JSON.stringify(message, undefined, 2)}`)
					panel?.webview.postMessage(message);

					if (message["command"] == "scopes") {
						const frameId: number = message["arguments"]["frameId"];
						if (frameId == firstFrameId) {
							firstFrameId = -1;
							firstFrameSeq = message["seq"];
						}
					}
				},
				onDidSendMessage(message) {
					// console.log(`< ${JSON.stringify(message, undefined, 2)}`)
					panel?.webview.postMessage(message);

					// If a variable is structured, request the strucure
					if (message["command"] == "variables") {
						for (var variable of message["body"]["variables"]) {
							if (variable["value"].includes("@")) {
								session.customRequest("variables", {"variablesReference": variable["variablesReference"]});
							}
						}
					}

					// Store the id of the first frame to not send multiple requests. Send requests for the rest
					if (message["command"] == "stackTrace") {
						const stackFrames: any[] = message["body"]["stackFrames"];
						firstFrameId = stackFrames[0]["id"];

						for (var i = 1; i < stackFrames.length; i++) {
							session.customRequest("scopes", {"frameId": stackFrames[i]["id"]});
						}
					}

					// Send a variables request for all but the first of the scopes
					if (message["command"] == "scopes") {
						if (message["request_seq"] == firstFrameSeq)
							firstFrameSeq = -1
						else {
							for (var scope of message["body"]["scopes"]) {
								session.customRequest("variables", {"variablesReference": scope["variablesReference"]});
							}
						}
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