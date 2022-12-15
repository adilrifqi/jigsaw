import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class ValueOfExpr extends Expr {
    private readonly subjectExpr: Expr;
    private readonly declaredType: ValueType;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(subjectExpr: Expr, declaredType: ValueType, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.subjectExpr = subjectExpr;
        this.declaredType = declaredType;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public type(): ValueType {
        return this.declaredType;
    }

    public eval(): Object {
        const subjectExprValue: Object = this.subjectExpr.eval() as Object;
        if (subjectExprValue instanceof RuntimeError) return subjectExprValue;

        const subjectValue: Object | null = this.runtime.getSubjectValue(subjectExprValue as Subject);
        if (subjectValue === null) return new RuntimeError(this.ctx, "Cannot get the value the subject of the variable of this type.");

        const valueTypeHere: string = typeof subjectValue;
        if ((this.declaredType == ValueType.BOOLEAN && valueTypeHere !== "boolean")
            || (this.declaredType == ValueType.NUM && valueTypeHere !== "number")
            || (this.declaredType == ValueType.STRING && valueTypeHere !== "string"))
            return new RuntimeError(this.ctx, "The value " + subjectValue + " does not match the declared type " + this.declaredType);

        return subjectValue;
    }
}