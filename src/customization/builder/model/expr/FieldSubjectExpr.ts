import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class FieldSubjectExpr extends Expr {
    private readonly fieldNames: string[];
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(fieldName: string[], runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.fieldNames = fieldName;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public type(): ValueType {
        return ValueType.SUBJECT;
    }

    public eval(): Object {
        var result: Subject | null = this.runtime.getCurrentVariableField(this.fieldNames[0]);
        for (var i = 1; i < this.fieldNames.length && result !== null; i++)
            result = this.runtime.getVariableFieldOf(result, this.fieldNames[i]);
        if (result === null) return new RuntimeError(this.ctx, "The subject with the path with name " + this.fieldNames.toString() + " does not exist in this location scope.");
        return result;
    }
}