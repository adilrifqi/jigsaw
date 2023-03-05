import * as vscode from 'vscode';
import { CustomizationBuilder } from './customization/builder/CustomizationBuilder';
import { RuntimeError } from './customization/builder/error/RuntimeError';
import { CustomizationRuntime } from './customization/builder/model/CustomizationRuntime';
import { ErrorComponent } from './customization/builder/model/ErrorComponent';
import { DebugState } from './debugmodel/DebugState';
import { EdgeInfo, NodeInfo } from './debugmodel/DiagramInfo';
import { JigsawVariable } from './debugmodel/JigsawVariable';
import { MethodSignature, StackFrame } from './debugmodel/StackFrame';

var custRuntime: CustomizationRuntime | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
	let panel: vscode.WebviewPanel | undefined = undefined;

	console.log('Congratulations, your extension "jigsaw" is now active!');

	let disposable = vscode.commands.registerCommand('jigsaw.helloWorld', () => {
		vscode.window.showInformationMessage('Hello Hello from JIGSAW!');

		vscode.workspace.openTextDocument(vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, "spec.jig")).then((document) => {
			const spec: string = document.getText();
			const newRuntime: CustomizationRuntime | ErrorComponent = new CustomizationBuilder().buildCustomization(spec);
			if (newRuntime instanceof ErrorComponent) vscode.window.showErrorMessage(newRuntime.getMessage());
			else console.log(custRuntime);
		});
	});
	context.subscriptions.push(disposable);

	// Debug Call Stack
	vscode.commands.registerCommand('stackFrames.visualizeFrame', (...args: any[]) => {
		const frameId: string = args[1]["frameId"];
        const frameIdSplitColon: string[] = frameId.split(':');
        const stackPos: number = +frameIdSplitColon[frameIdSplitColon.length - 2];

		const graphResult: {nodes: NodeInfo[], edges: EdgeInfo[]} | RuntimeError | string = getFrameGraph(stackPos);
		if (typeof graphResult === "string") vscode.window.showErrorMessage(graphResult);
		else if (graphResult instanceof RuntimeError) vscode.window.showErrorMessage(graphResult.toString());
		else panel?.webview.postMessage({"command": "data", "body": graphResult});
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
					console.log(`> ${JSON.stringify(message, undefined, 2)}`)
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
					console.log(`< ${JSON.stringify(message, undefined, 2)}`)
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
            			    callStack.set(frameId, new StackFrame(frameId, MethodSignature.extractSignature(stackFrames[i]["name"])));

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
							if (variable["name"] === "Class has no fields") {
								DebugState.getInstance().removeRequestSeqFromAllFrames(message["request_seq"]);
								continue;
							}
							const jigsawVariable: JigsawVariable | undefined = parseVariable(variable);
							if (jigsawVariable) {
								const seq: number = message["request_seq"];
								const involvedFrameId: number = DebugState.getInstance().setVariableToFrame(jigsawVariable, seq);
								involvedSeqs.add(seq);
								if (involvedFrameId > -1) involvedFrames.add(involvedFrameId);
							} else {
								const seq: number = message["request_seq"];
								const varsRef: number = variable["variablesReference"];
								if (!DebugState.getInstance().handleLazyFollowUp(seq, varsRef, variable["value"]))
									handleVariableValueReplacement(message);
								DebugState.getInstance().removeRequestSeqFromAllFrames(seq);
							}

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
							const graphResult: {nodes: NodeInfo[], edges: EdgeInfo[]} | RuntimeError | string = getFrameGraph(0);
							if (typeof graphResult === "string") vscode.window.showErrorMessage(graphResult);
							else if (graphResult instanceof RuntimeError) vscode.window.showErrorMessage(graphResult.toString());
							else panel?.webview.postMessage({command: "data", body: graphResult});
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
			vscode.workspace.openTextDocument(vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, "spec.jig")).then((document) => {
				const spec: string = document.getText();
				const newRuntime: CustomizationRuntime | ErrorComponent = new CustomizationBuilder().buildCustomization(spec);

				if (newRuntime instanceof ErrorComponent) vscode.window.showErrorMessage(newRuntime.getMessage());
				else {
					custRuntime = newRuntime;

					panel = vscode.window.createWebviewPanel(
						'showReactFlow',
						'JIGSAW State Visualization',
						vscode.ViewColumn.One,
						{
							enableScripts: true,
							retainContextWhenHidden: true
						}
					);
					panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);
				}
			});
		})
	);

	vscode.debug.onDidStartDebugSession((session: vscode.DebugSession) => {
		// TODO: Debug
		// vscode.window.showInformationMessage("lmao");
		// vscode.workspace.openTextDocument(vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, "spec.jig")).then((document) => {
		// 	const spec: string = document.getText();
		// 	const newRuntime: CustomizationRuntime | ErrorComponent = new CustomizationBuilder().buildCustomization(spec);

		// 	if (newRuntime instanceof ErrorComponent) vscode.window.showErrorMessage(newRuntime.getMessage());
		// 	else {
		// 		custRuntime = newRuntime;

		// 		panel = vscode.window.createWebviewPanel(
		// 			'showReactFlow',
		// 			'React Flow Sample View',
		// 			vscode.ViewColumn.One,
		// 			{
		// 				enableScripts: true,
		// 				retainContextWhenHidden: true
		// 			}
		// 		);
		// 		panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);
		// 	}
		// });
	});
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

function getFrameGraph(stackPos: number): {nodes: NodeInfo[], edges: EdgeInfo[]} | RuntimeError | string {
	if (!custRuntime) return "Customization runtime has not been initialized";
	if (custRuntime instanceof ErrorComponent) return custRuntime.getMessage();

	const nodes: NodeInfo[] = [];
	const edges: EdgeInfo[] = [];
	const frameToSend: StackFrame | undefined = DebugState.getInstance().getFrameByPos(stackPos);
	if (frameToSend) {
		frameToSend.jigsawVariables.forEach((variable: JigsawVariable, varKey: string) => {
			if (!varKey.includes(".")) { // The variable in this context is not a field of another
				const inNodeFields: {name: string, type: string, value: any}[] = [];
				variable.variables.forEach((varsVarKey: string, fieldName: string) => {
					const varsVar: JigsawVariable | undefined = frameToSend.jigsawVariables.get(varsVarKey);
					if (varsVar) {
						if (!varsVar.value.includes("@"))
							inNodeFields.push({
								name: fieldName,
								type: varsVar.type,
								value: varsVar.value
							});
						else
							edges.push({
								id: varKey + "-" + varsVarKey,
								source: varKey,
								target: varsVarKey,
								label: fieldName,
								type: 'floating'
							});
					}
				});
				nodes.push({
					id: varKey,
					position: { x: 0, y: 0 },
					type: 'object',
					data: {
						title: {name: variable.name, type: variable.type, value: variable.value},
						scopeTopVar: frameToSend.isScopeTopVar(varKey),
						rows: inNodeFields
					}
				});
			}
		});
	}
	const result: {nodes: NodeInfo[], edges: EdgeInfo[]} = {nodes: nodes, edges: edges};
	return custRuntime.applyCustomization(result.nodes, result.edges, stackPos);
	// return result;
}

function parseVariable(toParse: {[key: string]: any}): JigsawVariable | undefined {
    const name: string = toParse["name"];
    const value: string = toParse["value"];
    const type: string = toParse["type"];
    const variablesReference: number = toParse["variablesReference"];
    const namedVariables: number = toParse["namedVariables"];
    const indexedVariables: number = toParse["indexedVariables"];
    const evaluateName: string = toParse["evaluateName"];
	const lazy: boolean = toParse["presentationHint"] != undefined && toParse["presentationHint"]["lazy"] != undefined && toParse["presentationHint"]["lazy"];

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
    return new JigsawVariable(name, value, type, variablesReference, namedVariables, indexedVariables, evaluateName, lazy);
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
