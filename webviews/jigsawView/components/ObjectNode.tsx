import React = require("react");
import { Handle, Position } from "react-flow-renderer";
import "./styles.css";

function ObjectNode(
    {data, isConnectable, targetPosition=Position.Top, sourcePosition=Position.Bottom}:
    {data:{variable: {[key: string]: any}, stackFrame: {[key: string]: {[key: string]: any}}, scopeTopVar: boolean}, isConnectable:boolean, targetPosition:string, sourcePosition:string}) {
        const stackFrame: {[key: string]: {[key: string]: any}} = data.stackFrame;
        const variable: {[key: string]: any} = data.variable;
        let titleString: string = data.scopeTopVar ? variable["name"] + "(" + variable["type"] + ")" : variable["type"];

        if (variable["value"].includes("@")){
            const rows: any[] = [];
            for (const fieldName in variable["variables"]) {
                const varsVarKey = variable["variables"][fieldName];
                if (varsVarKey.includes(".")) {
                    const varsVar = stackFrame[varsVarKey];
                    rows.push(<p
                        key={variable["name"] + "-" + varsVarKey}
                        className="unstructured-field">
                            {fieldName + "(" + varsVar["type"] + "): " + varsVar["value"]}
                        </p>)
                }
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
            titleString += ": " + variable["value"];
            return (
                <div className="object-node">
                    <Handle type="target" position={targetPosition} isConnectable={isConnectable} />
                    <p className="title">{titleString}</p>
                    <Handle type="source" position={sourcePosition} isConnectable={isConnectable} />
                </div>
            )
        }
}

export default ObjectNode;