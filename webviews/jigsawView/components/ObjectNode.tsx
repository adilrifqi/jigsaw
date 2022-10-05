import React = require("react");
import { Handle, Position } from "react-flow-renderer";
import { DebugState } from "../model/DebugState";
import { JigsawVariable } from "../model/JigsawVariable";
import "./styles.css";

function ObjectNode(
    {data, isConnectable, targetPosition=Position.Top, sourcePosition=Position.Bottom}:
    {data:{variable: JigsawVariable, scopeTopVar: boolean}, isConnectable:boolean, targetPosition:string, sourcePosition:string}) {
        const variable: JigsawVariable = data.variable;
        const ds: DebugState = DebugState.getInstance();
        let titleString: string = data.scopeTopVar ? variable.name + "(" + variable.type + ")" : variable.type;

        if (variable.value.includes("@")){
            const rows: any[] = [];
            variable.getFields().forEach((varsVarKey:string, fieldName:string) => {
                if (varsVarKey.includes(".")) {
                    const varsVar: JigsawVariable | undefined = ds.jigsawVariables.get(varsVarKey);
                    if (varsVar)
                        rows.push(<p
                            key={variable.name + "-" + varsVarKey}
                            className="unstructured-field">
                                {fieldName + "(" + varsVar.type + "): " + varsVar.value}
                            </p>)
                }
            });

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
            )
        }
}

export default ObjectNode;