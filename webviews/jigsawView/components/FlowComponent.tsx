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
    markerEnd: MarkerType;
};
type FloatingEdge = Edge<EdgeData>;
const edgeTypes = {
    floating: FloatingEdge,
};
// #endregion Custom Edge Declaration

// TODO: Make references have the names of the variables on the edges
export function FlowComponent() {
    // Hooks
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Listen for DAP messages sent from the extension
    window.addEventListener('message', event => {
        const data = event.data;

        // Clear to refresh stored variables in case scope(s) has been exited.
        if (data["type"] == "response" && data["command"] == "scopes") {
            DebugState.getInstance().clearVariables();
        }
        
        // parse and update the DebugState if the message is a "variables" response
        if (data["type"] == "response" && data["command"] == "variables") {
            for (var variable of data["body"]["variables"]) {
                const parsedVariable: JigsawVariable | undefined = parseVariable(variable);
                if (parsedVariable) {
                    DebugState.getInstance().updateVariable(parsedVariable, data["request_seq"]);
                }
            }
        }

        // Compile the variable nodes and their reference edges
        const varNodes: React.SetStateAction<Node<any>[]> | { id: string; data: { variable: JigsawVariable; }; position: { x: number; y: number; }; type: string; }[] = [];
        const varEdges: React.SetStateAction<Edge<any>[]> | { id: string; source: string; target: string; markerEnd: { type: MarkerType; }; type: string; }[] = [];
        DebugState.getInstance().jigsawVariables.forEach((variable: JigsawVariable, key: string) => {
            // Only add a node and its outgoing edges if the variable is structured
            if (!key.includes(".")) {
                varNodes.push({
                    id: key,
                    data: {variable: variable},
                    position: { x: 250, y: 25 },
                    type: 'object'
                });

                for (var reffedKey of variable.getVariablesKeys()) {
                    // Only add outgoing edges to structured references
                    if (!reffedKey.includes(".")) {
                        varEdges.push({
                            id: key + "-" + reffedKey,
                            source: key,
                            target: reffedKey,
                            markerEnd: { type: MarkerType.Arrow },
                            type:'floating'
                        });
                    }
                }
            }
        });

        // Update the node and edge states
        setNodes(varNodes);
        setEdges(varEdges);
    })

    // return <h1>Hello</h1>;

    return (
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
    );
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