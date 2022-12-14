import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class FieldSubjectExpr extends Expr {
    private readonly fieldName: string;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(fieldName: string, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.fieldName = fieldName;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public type(): ValueType {
        return ValueType.SUBJECT;
    }

    public eval(): Object {
        const result: Subject | null = this.runtime.getCurrentVariableField(this.fieldName);
        if (result === null) return new RuntimeError(this.ctx, "Field with name " + this.fieldName + " does not exist in this location scope.");
        return result as Subject;
    }
}