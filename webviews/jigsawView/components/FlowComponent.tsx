import { useCallback } from "react";
import React = require("react");
import ReactFlow, {
    addEdge,
    Background,
    Connection,
    Controls,
    Edge,
    MiniMap,
    Node,
    useEdgesState,
    useNodesState
} from "react-flow-renderer";
import { DebugState } from "../model/DebugState";
import { JigsawVariable } from "../model/JigsawVariable";

export function FlowComponent() {
    // Hooks
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const onConnect = useCallback(
        (connection: Edge<any> | Connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges]
    );

    // Listen for DAP messages sent from the extension
    window.addEventListener('message', event => {
        const data = event.data;
        
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
        const varNodes: React.SetStateAction<Node<any>[]>
            | { id: string; type: string; data: { label: string; }; position: { x: number; y: number; }; }[] = [];
        const varEdges: ((prevState: Edge<any>[]) => Edge<any>[]) | { id: string; source: string; target: string; }[] = [];
        DebugState.getInstance().jigsawVariables.forEach((variable: JigsawVariable, key: string) => {
            varNodes.push({
                id: key,
                type:'default',
                data: {label: variable.name + ": " + variable.value},
                position: { x: 250, y: 25 }
            });

            for (var reffedKey of variable.getVariablesKeys()) {
                console.log("lmao");
                varEdges.push({
                    id: key + "-" + reffedKey,
                    source: key,
                    target: reffedKey
                });
            }
        });

        // Update the node and edge states
        setNodes(varNodes);
        setEdges(varEdges);
    })

    // return <h1>Hello</h1>;

    return (
        <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
          fitView>
            <MiniMap/>
            <Controls/>
            <Background/>
          </ReactFlow>
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