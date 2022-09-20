import { useState } from "react";
import React = require("react");
import ReactFlow, { Background, Controls, MiniMap } from "react-flow-renderer";
import { DebugState } from "./DebugState";

export function FlowComponent() {
    const [variables, setVariables] = useState(() => DebugState.getInstance().variables);

    // Listen for DAP messages sent from the extension
    window.addEventListener('message', event => {
        let data = event.data
        if (data["command"] == "variables") {
            DebugState.getInstance().variables = data["body"]["variables"];
            setVariables(_ => DebugState.getInstance().variables);
        }
    })

    const varNodes = []
    for (var variable of variables) {
        const varName = variable["name"];
        varNodes.push({
            id: varName,
            type:'input',
            data: {label: varName + ": " + variable["value"]},
            position: { x: 250, y: 25 }
        });
    }

    return (
        <ReactFlow
          nodes={varNodes}
          fitView>
            <MiniMap/>
            <Controls/>
            <Background/>
          </ReactFlow>
    );
}