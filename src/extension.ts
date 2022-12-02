import * as vscode from 'vscode';
import { CustomizationBuilder } from './customization/builder/CustomizationBuilder';
import { CustomizationRuntime } from './customization/builder/model/CustomizationRuntime';
import { ErrorComponent } from './customization/builder/model/ErrorComponent';
import { DebugState } from './debugmodel/DebugState';
import { JigsawVariable } from './debugmodel/JigsawVariable';
import { StackFrame } from './debugmodel/StackFrame';

export function activate(context: vscode.ExtensionContext) {
	let panel: vscode.WebviewPanel | undefined = undefined;

	console.log('Congratulations, your extension "jigsaw" is now active!');

	let disposable = vscode.commands.registerCommand('jigsaw.helloWorld', () => {
		vscode.window.showInformationMessage('Hello Hello from JIGSAW!');

		const spec: string = "class Lemao {String nodeName = \"lelnode\"; Node node1 = newNode(nodeName); Node node2 = newNode(\"lolNode\"); Edge edge = newEdge(node1, node2);}"
		const cust: CustomizationRuntime | ErrorComponent = new CustomizationBuilder().buildCustomization(spec);
		if (cust instanceof CustomizationRuntime) cust.applyCustomization();
		console.log(cust);
	});
	context.subscriptions.push(disposable);

	// Debug Call Stack
	vscode.commands.registerCommand('stackFrames.visualizeFrame', (...args: any[]) => {
		panel?.webview.postMessage({"command": "jigsaw:visualizeFrame", "body": args[1]});
	})

	// Keep track to not requests for the first frames of stacks so as not to send duplicates
	var firstFrameId: number = -1;
	var firstFrameSeq: number = -1;
	var hasReceivedVariables: boolean = false;

	// DAP
	let lmao = vscode.debug.registerDebugAdapterTrackerFactory('*', {
		createDebugAdapterTracker(session: vscode.DebugSession) {

			DebugState.getInstance().clear();

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

						DebugState.getInstance().setScopesSeqToFrameId(message["seq"],  message["arguments"]["frameId"]);
					}

					if (message["command"] == "variables") {
						const varsRef: number = message["arguments"]["variablesReference"];
						DebugState.getInstance().setVariablesSeqToFrameId(message["seq"], varsRef);
					}
				},
				onDidSendMessage(message) {
					// console.log(`< ${JSON.stringify(message, undefined, 2)}`)
					panel?.webview.postMessage(message);

					// Store the id of the first frame to not send multiple requests. Send requests for the rest
					if (message["command"] == "stackTrace") {
						hasReceivedVariables = false;
						DebugState.getInstance().clear();

						const stackFrames: any[] = message["body"]["stackFrames"];
						firstFrameId = stackFrames[0]["id"];

						const callStack: Map<number, StackFrame> = new Map();
						for (var i = 0; i < stackFrames.length; i++) {
							const frameId: number = stackFrames[i]["id"];
            			    callStack.set(frameId, new StackFrame(frameId));

							if (i > 0)
								session.customRequest("scopes", {"frameId": stackFrames[i]["id"]});
						}
						DebugState.getInstance().setCallStack(callStack);
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

						const varsRef: number = message["body"]["scopes"][0]["variablesReference"];
            			DebugState.getInstance().setScopesVarRefToFrameId(varsRef, message["request_seq"]);
					}

					// If a variable is structured, request the strucure
					if (message["command"] == "variables") {
						hasReceivedVariables = true;
						const reqSeq: number = message["request_seq"];
						DebugState.getInstance().addFrameIdToStructVars(reqSeq);

						const involvedFrames: Set<number> = new Set();
            			const involvedSeqs: Set<number> = new Set();
						for (var variable of message["body"]["variables"]) {
							const jigsawVariable: JigsawVariable | undefined = parseVariable(variable);
							if (jigsawVariable) {
								const seq: number = message["request_seq"];
								const involvedFrameId: number = DebugState.getInstance().setVariableToFrame(jigsawVariable, seq);
								involvedSeqs.add(seq);
								if (involvedFrameId > -1) involvedFrames.add(involvedFrameId);
							} else handleVariableValueReplacement(message);

							const varValue: string = variable["value"];
							if (varValue.includes("@")) {
								if (!DebugState.getInstance().frameHasStructVar(reqSeq, varValue)) {
									DebugState.getInstance().correlateFrameIdToStructVar(reqSeq, varValue);
									DebugState.getInstance().addPendingVarsRef(variable["variablesReference"]);
									session.customRequest("variables", {"variablesReference": variable["variablesReference"]});
								}
							}
						}
						for (var involvedFrameId of involvedFrames) 
							DebugState.getInstance().getFrameById(involvedFrameId)?.scopeTopToggleOff();
						for (var involvedSeq of involvedSeqs) 
							DebugState.getInstance().removeSeqFromFrame(involvedSeq);
						
						if (DebugState.getInstance().complete() && hasReceivedVariables) {
							const frameIdToStackFrame: {[key: number]: {[key: string]: {[key: string]: any}}} = {};
							DebugState.getInstance().callStack.forEach((stackFrame: StackFrame, frameId: number) => {
								const varKeyToVariable: {[key: string]: {[key: string]: any}} = {};
								stackFrame.jigsawVariables.forEach((variable: JigsawVariable, varKey: string) => {
									const variables: {[key: string]: string} = {};
									variable.variables.forEach((value: string, key: string) => {
										variables[key] = value;
									});

									const toPush: {[key: string]: any} = {
										"name": variable.name,
										"value": variable.value,
										"type": variable.type,
										"variablesReference": variable.variablesReference,
										"namedVariables": variable.namedVariables,
										"indexedVariables": variable.indexedVariables,
										"evaluateName": variable.evaluateName,
										"scopeTopVar": stackFrame.isScopeTopVar(varKey),
										variables: variables
									};
									varKeyToVariable[varKey] = toPush;
								});
								frameIdToStackFrame[frameId] = varKeyToVariable;
							});
							panel?.webview.postMessage({command: "data", body: {data: frameIdToStackFrame}});
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

function parseVariable(toParse: {[key: string]: any}): JigsawVariable | undefined {
    const name: string = toParse["name"];
    const value: string = toParse["value"];
    const type: string = toParse["type"];
    const variablesReference: number = toParse["variablesReference"];
    const namedVariables: number = toParse["namedVariables"];
    const indexedVariables: number = toParse["indexedVariables"];
    const evaluateName: string = toParse["evaluateName"];

    if (
        !name
        || !value
        || !type
        || variablesReference == undefined
        || namedVariables == undefined
        || indexedVariables == undefined
        || !evaluateName
        ) {
        return undefined;
    }
    return new JigsawVariable(name, value, type, variablesReference, namedVariables, indexedVariables, evaluateName);
}

function handleVariableValueReplacement(data: {[key: string]: any}) {
	const variable = data["body"]["variables"][0];
	const name: string = variable["name"];
    const value: string = variable["value"];
    const type: string = variable["type"];
    const variablesReference: number = variable["variablesReference"];
    const namedVariables: number = variable["namedVariables"];
    const indexedVariables: number = variable["indexedVariables"];
    const evaluateName: string = variable["evaluateName"];

	if (!name && value && !type && variablesReference != undefined
		&& namedVariables != undefined && indexedVariables != undefined && evaluateName) {
		DebugState.getInstance().setVariablesVarsRefToFrameId(variablesReference, data["request_seq"]);
		DebugState.getInstance().addReplaceVarsRefToVarKey(variablesReference, data["request_seq"]);
	}
}
