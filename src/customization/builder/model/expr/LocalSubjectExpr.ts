import { ParserRuleContext } from "antlr4ts";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class LocalSubjectExpr extends Expr {
    private readonly localVariableName: string;
    private readonly runtime: CustomizationRuntime;

    constructor(localVariableName: string, runtime: CustomizationRuntime) {
        super();
        this.localVariableName = localVariableName;
        this.runtime = runtime;
    }

    public type(): ValueType {
        return ValueType.SUBJECT;
    }

    public eval(): Object | null {
        return this.runtime.getLocalVariable(this.localVariableName);
    }
}