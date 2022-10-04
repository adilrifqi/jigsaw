import React = require("react");
import { Handle, Position } from "react-flow-renderer";
import { DebugState } from "../model/DebugState";
import { JigsawVariable } from "../model/JigsawVariable";
import "./styles.css";

function ObjectNode(
    {data, isConnectable, targetPosition=Position.Top, sourcePosition=Position.Bottom}:
    {data:{variable: JigsawVariable}, isConnectable:boolean, targetPosition:string, sourcePosition:string}) {
        const variable: JigsawVariable = data.variable;
        const ds: DebugState = DebugState.getInstance();

        if (variable.value.includes("@")){
            const rows = [];
            for (var varsVarKey of variable.getVariablesKeys()) {
                if (varsVarKey.includes(".")) {
                    const varsVar: JigsawVariable | undefined = ds.jigsawVariables.get(varsVarKey);
                    if (varsVar)
                        rows.push(<p
                            key={variable.name + "-" + varsVarKey}
                            className="unstructured-field">
                                {varsVar.name + "(" + varsVar.type + "): " + varsVar.value}
                            </p>)
                }
            }

            return (
                <div className="object-node">
                    <Handle type="target" position={targetPosition} isConnectable={isConnectable} />
                    <p className="title">{variable.name + "(" + variable.type + ")"}</p>
                    <hr/>
                    {rows}
                    <Handle type="source" position={sourcePosition} isConnectable={isConnectable} />
                </div>
            )
        } else {
            return (
                <div className="object-node">
                    <Handle type="target" position={targetPosition} isConnectable={isConnectable} />
                    <p className="title">{variable.name + "(" + variable.type + "): " + variable.value}</p>
                    <Handle type="source" position={sourcePosition} isConnectable={isConnectable} />
                </div>
            )
        }
}

export default ObjectNode;