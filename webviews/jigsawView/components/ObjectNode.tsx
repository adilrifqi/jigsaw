import React = require("react");
import { Handle, Position } from "react-flow-renderer";
import "./styles.css";

type VariableInfo = {name: string, type: string, value: string};

function ObjectNode (
    {data, isConnectable, targetPosition=Position.Top, sourcePosition=Position.Bottom}:
    {data: {variable: VariableInfo, scopeTopVar: boolean, inNodeFields: VariableInfo[]}, isConnectable: boolean, targetPosition: string, sourcePosition: string}
) {
    const variable: VariableInfo = data.variable;
    let titleString: string = data.scopeTopVar ? variable.name + "(" + variable.type + ")" : variable.type;

    if (variable.value.includes("@")) {
        const rows = [];
        for (var inNodeField of data.inNodeFields) {
            rows.push(<p
            key={variable.name + ":" + inNodeField.name}
            className="unstructured-field">
                {inNodeField.name + "(" + inNodeField.type + "): " + inNodeField.value}
            </p>)
        }
        return (
            <div className="object-node">
                <Handle type="target" position={targetPosition} isConnectable={isConnectable} />
                <p className="title">{titleString}</p>
                <hr/>
                {rows}
                <Handle type="source" position={sourcePosition} isConnectable={isConnectable} />
            </div>
        )
    } else {
        titleString += ": " + variable.value;
        return (
        <div className="object-node">
            <Handle type="target" position={targetPosition} isConnectable={isConnectable} />
            <p className="title">{titleString}</p>
            <Handle type="source" position={sourcePosition} isConnectable={isConnectable} />
        </div>
        );
    }
}

export default ObjectNode;