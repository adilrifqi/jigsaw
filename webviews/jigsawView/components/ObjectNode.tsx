import React = require("react");
import { Handle, Position } from "react-flow-renderer";
import { Node } from "../../../src/customization/builder/model/Node";
import "./styles.css";

function ObjectNode(
    {data, isConnectable, targetPosition=Position.Top, sourcePosition=Position.Bottom}:
    {data:{variable: {[key: string]: any} | Node, stackFrame?: {[key: string]: {[key: string]: any}}, scopeTopVar: boolean}, isConnectable:boolean, targetPosition:string, sourcePosition:string}) {
        const variable: {[key: string]: any} = data.variable;
        let titleString: string = variable instanceof Node ? (variable as Node).getName() : (data.scopeTopVar ? variable["name"] + "(" + variable["type"] + ")" : variable["type"]);

        if (!(variable instanceof Node) && variable["value"].includes("@")){
            const stackFrame: {[key: string]: {[key: string]: any}} = data.stackFrame!;
            const rows: any[] = [];
            for (const fieldName in variable["variables"]) {
                const varsVarKey = variable["variables"][fieldName];
                const varsVar = stackFrame[varsVarKey];
                if (!varsVar["value"].includes("@")) {
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
            if (!(variable instanceof Node)) titleString += ": " + variable["value"];
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