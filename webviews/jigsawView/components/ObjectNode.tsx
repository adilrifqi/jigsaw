import React = require("react");
import { Handle, Position } from "react-flow-renderer";
import { VariableInfo } from "../../../src/debugmodel/DiagramInfo";
import "./styles.css";

function ObjectNode (
    {data, isConnectable, targetPosition=Position.Top, sourcePosition=Position.Bottom}:
    {data: {title: VariableInfo | string, scopeTopVar?: boolean, rows: (VariableInfo | string)[]}, isConnectable: boolean, targetPosition: string, sourcePosition: string}
) {
    const titleInfo: VariableInfo | string = data.title;
    let title: string;
    if (typeof titleInfo === 'string') title = titleInfo;
    else {
        const scopeTopVar: boolean = data.scopeTopVar !== undefined &&  data.scopeTopVar !== null ? data.scopeTopVar : false;
        title = scopeTopVar ? titleInfo.name + "(" + titleInfo.type + ")" : titleInfo.type;
        if (!titleInfo.value.includes("@")) title += ": " + titleInfo.value;
    }

    if (data.rows.length > 0) {
        const rows = [];
        for (var row of data.rows) {
            if (typeof row === 'string')
                rows.push(<p key={title} className="unstructured-field">{row}</p>);
            else
                rows.push(<p
                key={row.name + ":" + row.name} className="unstructured-field">
                    {row.name + "(" + row.type + "): " + row.value}
                </p>);
        }
        return (
            <div className="object-node" style={{borderWidth:3, borderColor:"black"}}>
                <Handle type="target" position={targetPosition} isConnectable={isConnectable} />
                <p className="title">{title}</p>
                <hr/>
                {rows}
                <Handle type="source" position={sourcePosition} isConnectable={isConnectable} />
            </div>
        );
    } else {
        return (
            <div className="object-node" style={{borderWidth:3, borderColor:"black"}}>
                <Handle type="target" position={targetPosition} isConnectable={isConnectable} />
                <p className="title">{title}</p>
                <Handle type="source" position={sourcePosition} isConnectable={isConnectable} />
            </div>
        );
    }
}

export default ObjectNode;