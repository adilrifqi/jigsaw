import * as dagre from "dagre";
import React = require("react");
import ReactFlow, {
    Background,
    Controls,
    Edge,
    MarkerType,
    MiniMap,
    Node,
    useEdgesState,
    useNodesState
} from "react-flow-renderer";
import { DebugState } from "../model/DebugState";
import { JigsawVariable } from "../model/JigsawVariable";
import { StackFrame } from "../model/StackFrame";
import FloatingEdge from './FloatingEdge';
import ObjectNode from "./ObjectNode";
import "./styles.css";

// #region Custom Node Declaration
type NodeData = {
    data: object,
    isConnectable: boolean,
    targetPosition: string,
    sourcePosition: string
}
type ObjectNode = Node<NodeData>;
const nodeTypes = {
    object: ObjectNode,
}
// #endregion Custom Node Declaration

// #region Custom Edge Declaration
type EdgeData = {
    id: string;
    source: string;
    target: string;
    label: string;
    markerEnd: MarkerType;
};
type FloatingEdge = Edge<EdgeData>;
const edgeTypes = {
    floating: FloatingEdge,
};
// #endregion Custom Edge Declaration

// Position of currently viewed stack frame
var currentStackPos = 0;

// Keep track of the dimensions of nodes for dagre and
//  in case dimension info doesn't appear in the layouting below.
const nodeDims: Map<string, { width: number, height: number }> = new Map();

export function FlowComponent() {
    // Hooks
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // #region eventListener
    // Listen for DAP messages sent from the extension
    window.addEventListener('message', event => {
        const data = event.data;

        // Received command from the extension to switch views
        if (data["command"] == "jigsaw:visualizeFrame") {
            const frameId: string = data["body"]["frameId"];
            const frameIdSplitColon: string[] = frameId.split(':');
            const stackPos: number = +frameIdSplitColon[frameIdSplitColon.length - 2];
            // DebugState.getInstance().setRecentStackPos(stackPos);
            currentStackPos = stackPos;
        }

        // New halt, clear everything from previous halt and repopulate the DebugState with the current state
        if (data["type"] == "response" && data["command"] == "stackTrace") {
            currentStackPos = 0; // Reset the viewed stack position
            DebugState.getInstance().clear();

            const callStack: Map<number, StackFrame> = new Map();
            for (var stackFrame of data["body"]["stackFrames"]) {
                const frameId: number = stackFrame["id"];
                callStack.set(frameId, new StackFrame(frameId));
            }
            DebugState.getInstance().setCallStack(callStack);
        }

        // Link the command stackTrace with the variables command
        if (data["type"] == "response" && data["command"] == "scopes") {
            const variablesReference: number = data["body"]["scopes"][0]["variablesReference"];
            DebugState.getInstance().setScopesVarRefToFrameId(variablesReference, data["request_seq"]);
        }

        // Set variables to the DebugState
        if (data["type"] == "response" && data["command"] == "variables") {
            const involvedFrames: Set<number> = new Set();
            for (var variable of data["body"]["variables"]) {
                const jigsawVariable: JigsawVariable | undefined = parseVariable(variable);
                if (jigsawVariable) {
                    const involvedFrameId: number = DebugState.getInstance().setVariableToFrame(jigsawVariable, data["request_seq"]);
                    if (involvedFrameId > -1) involvedFrames.add(involvedFrameId);
                }
            }
            for (var involvedFrameId of involvedFrames) {
                DebugState.getInstance().getFrameById(involvedFrameId)?.scopeTopToggleOff();
            }
        }

        // Compile the variable nodes and their reference edges
        const varNodes: any[] = [];
        const varEdges: any[] = [];
        DebugState.getInstance().getFrameByPos(currentStackPos)?.jigsawVariables.forEach((variable: JigsawVariable, key: string) => {
            // Only add a node and its outgoing edges if the variable is structured
            if (!key.includes(".")) {
                varNodes.push({
                    id: key,
                    data: {variable: variable, stackPos: currentStackPos, scopeTopVar: DebugState.getInstance().getFrameByPos(currentStackPos)?.isScopeTopVar(key)},
                    position: { x: 250, y: 25 },
                    type: 'object'
                });

                variable.getFields().forEach((reffedKey:string, fieldName:string) => {
                    if (!reffedKey.includes(".")) {
                        varEdges.push({
                            id: key + "-" + reffedKey,
                            source: key,
                            target: reffedKey,
                            label: fieldName,
                            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
                            type:'floating'
                        });
                    }
                });
            }
        });
        // #endregion eventListener

        // Update the node and edge states
        setNodes(Array.from(varNodes.values()));
        setEdges(Array.from(varEdges.values()));
    })
    // #endregion eventListener

    // return <h1>Hello</h1>;

    // #region dagre layouting
    // Get the element to get the dimensions of the nodes for dagre layouting,
    //  since dimensions are calculated depending on parent
    var element: JSX.Element =
        <div className="floatingedges" style={{width: "100%", height:"100vh"}}>
            <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
              fitView>
                <MiniMap/>
                <Controls/>
                <Background/>
              </ReactFlow>
        </div>
    const nodeElements: any[] = element["props"]["children"]["props"]["nodes"];

    // Use the dagre library with the dimensions info to determine the layout
    var g = new dagre.graphlib.Graph();
    g.setGraph({});
    g.setDefaultEdgeLabel(function() { return {}; });
    for (var nodeElement of nodeElements) {
        const nodeElementId: string = nodeElement["id"];
        const nodeDim: {height: number, width: number} | undefined = nodeDims.get(nodeElementId);
        const height: number | undefined = nodeElement["height"] != undefined ?
            nodeElement["height"]
            : (nodeDim ? nodeDim.height : undefined);
        const width: number | undefined = nodeElement["width"] != undefined ?
            nodeElement["width"]
            : (nodeDim ? nodeDim.width : undefined);

        if (height != undefined && width != undefined) {
            g.setNode(nodeElementId, { width: width, height: height });
            nodeDims.set(nodeElementId, { width: width, height: height });
        }
    }
    for (var edge of edges) {
        const source: string = edge.source;
        const target: string = edge.target;
        if (g.nodes().includes(source) && g.nodes().includes(target)) {
            g.setEdge(source, target);
        }
    }
    console.log(DebugState.getInstance().callStack);
    dagre.layout(g);

    // Update the position of the actual nodes with info from the dagre layout
    g.nodes().forEach(function(nodeId) {
        const dagreNode = g.node(nodeId);
        for (var elementNode of element["props"]["children"]["props"]["nodes"]) {
            if (elementNode.id == nodeId) {
                elementNode.position = { x: dagreNode.x, y: dagreNode.y };
                break;
            }
        }
    });
    // #endregion dagre layouting

    return element;
}

function parseVariable(toParse: {[key: string]: any}): JigsawVariable | undefined {
    const name: string = toParse["name"];
    const value: string = toParse["value"];
    const type: string = toParse["type"];
    const variablesReference: number = toParse["variablesReference"];
    const namedVariables: number = toParse["namedVariables"];
    const indexedVariables: number = toParse["indexedVariables"];
    const evaluateName: string = toParse["evaluateName"];

    // console.log("=================================");
    // console.log("name: " + name);
    // console.log("value: " + value);
    // console.log("type: " + type);
    // console.log("variablesReference: " + variablesReference);
    // console.log("namedVariables: " + namedVariables);
    // console.log("indexedVariables: " + indexedVariables);
    // console.log("evaluateName: " + evaluateName);
    
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