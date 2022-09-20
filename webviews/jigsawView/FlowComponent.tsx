import { useCallback, useState } from "react";
import React = require("react");
import ReactFlow, { addEdge, Background, Connection, Controls, Edge, MiniMap, Node, useEdgesState, useNodesState } from "react-flow-renderer";
import { DebugState } from "./DebugState";

export function FlowComponent() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const onConnect = useCallback(
        (connection: Edge<any> | Connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges]
    );

    window.addEventListener('message', event => {
        let data = event.data
        if (data["command"] == "variables") {
            DebugState.getInstance().variables = data["body"]["variables"];
        }

        const varNodes = []
        for (var variable of DebugState.getInstance().variables) {
            const varName = variable["name"];
            varNodes.push({
                id: varName,
                type:'input',
                data: {label: varName + ": " + variable["value"]},
                position: { x: 250, y: 25 }
            });
        }
        setNodes(varNodes);
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