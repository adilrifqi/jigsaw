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

	const frameIdToStructVars: Map<number, Set<string>> = new Map();

	const scopesSeqToFrameId: Map<number, number> = new Map();
	const scopesVarsRefToFrameId: Map<number, number> = new Map();

	const variablesSeqToFrameId: Map<number, number> = new Map();
	const variablesVarsRefToFrameId: Map<number, number> = new Map();

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

						scopesSeqToFrameId.set(message["seq"], message["arguments"]["frameId"]);
					}

					if (message["command"] == "variables") {
						const varsRef: number = message["arguments"]["variablesReference"];
						var ofFrameId: number | undefined = scopesVarsRefToFrameId.get(varsRef);
						ofFrameId = ofFrameId != undefined ? ofFrameId : variablesVarsRefToFrameId.get(varsRef);
						if (ofFrameId != undefined)
							variablesSeqToFrameId.set(message["seq"], ofFrameId);
					}
				},
				onDidSendMessage(message) {
					// console.log(`< ${JSON.stringify(message, undefined, 2)}`)
					panel?.webview.postMessage(message);

					// Store the id of the first frame to not send multiple requests. Send requests for the rest
					if (message["command"] == "stackTrace") {
						const stackFrames: any[] = message["body"]["stackFrames"];
						firstFrameId = stackFrames[0]["id"];

						for (var i = 1; i < stackFrames.length; i++) {
							session.customRequest("scopes", {"frameId": stackFrames[i]["id"]});
						}

						// Clear maps as the DebugState is reset as well
						frameIdToStructVars.clear();
						scopesSeqToFrameId.clear();
						scopesVarsRefToFrameId.clear();
						variablesSeqToFrameId.clear();
						variablesVarsRefToFrameId.clear();
					}

					// Send a variables request for all but the first of the scopes
					if (message["command"] == "scopes") {
						if (message["body"]["scopes"].length > 1)
							console.log("THERE'S A MULTISCOPED \"scopes\"!!!");

						if (message["request_seq"] == firstFrameSeq)
							firstFrameSeq = -1
						else {
							for (var scope of message["body"]["scopes"]) {
								session.customRequest("variables", {"variablesReference": scope["variablesReference"]});
							}
						}

						const ofFrameId: number | undefined = scopesSeqToFrameId.get(message["request_seq"]);
						if (ofFrameId != undefined)
							scopesVarsRefToFrameId.set(message["body"]["scopes"][0]["variablesReference"], ofFrameId);
					}

					// If a variable is structured, request the strucure
					if (message["command"] == "variables") {
						const ofFrameId: number | undefined = variablesSeqToFrameId.get(message["request_seq"]);
						if (ofFrameId != undefined)
							if (!frameIdToStructVars.has(ofFrameId)) frameIdToStructVars.set(ofFrameId, new Set());

						for (var variable of message["body"]["variables"]) {
							const varValue: string = variable["value"];
							if (varValue.includes("@")) {
								if (ofFrameId != undefined && !frameIdToStructVars.get(ofFrameId)?.has(varValue)) {
									frameIdToStructVars.get(ofFrameId)?.add(varValue);
									variablesVarsRefToFrameId.set(variable["variablesReference"], ofFrameId);
									session.customRequest("variables", {"variablesReference": variable["variablesReference"]});
								}
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