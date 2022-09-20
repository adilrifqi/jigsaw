import * as React from "react";
import ReactFlow, { addEdge, Background, Connection, Controls, Edge, MiniMap, useEdgesState, useNodesState } from "react-flow-renderer";
import { DebugState } from "./DebugState";

export class FlowComponent extends React.Component<{}, { variables: { [key: string]: string }[] }> {
    private _dState: DebugState = DebugState.getInstance();

    constructor(props: {} | Readonly<{}>) {
        super(props);
        this.state = {
            variables: this._dState.variables
        }
    }

    render(): React.ReactNode {
        window.addEventListener('message', event => {
            let data = event.data
            if (data["command"] == "variables") {
                this._dState.variables = data["body"]["variables"];
                this.setState({variables: this._dState.variables});
            }
        })

        const varNodes = []
        for (var variable of this.state.variables) {
            const varName = variable["name"];
            varNodes.push({id: varName, type:'input', data: {label: varName + ": " + variable["value"]}, position: { x: 250, y: 25 }});
        }

        // return <h1>Hello</h1>;

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
}