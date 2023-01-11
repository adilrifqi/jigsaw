import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { ArrayType } from "./ArrayExpr";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class ValueOfExpr extends Expr {
    private readonly subjectExpr: Expr;
    private readonly declaredType: ValueType | ArrayType;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(subjectExpr: Expr, declaredType: ValueType | ArrayType, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.subjectExpr = subjectExpr;
        this.declaredType = declaredType;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public type(): ValueType | ArrayType {
        return this.declaredType;
    }

    public eval(): Object | null {
        const subjectExprValue: Object = this.subjectExpr.eval() as Object;
        if (subjectExprValue instanceof RuntimeError) return subjectExprValue;
        if (subjectExprValue === null) {
            switch (this.type()) {
                // NUM, BOOLEAN, STRING, NODE, EDGE, SUBJECT
                case ValueType.NUM: return 0;
                case ValueType.BOOLEAN: return false;
                case ValueType.STRING: return "null";
                case ValueType.NODE: return null;
                case ValueType.EDGE: return null;
                case ValueType.SUBJECT: return null;
                default: return null;
            }
        }

        const subjectValue: {value: Object, type: ValueType | ArrayType} | null = this.runtime.getSubjectValue(subjectExprValue as Subject);
        if (subjectValue === null) return new RuntimeError(this.ctx, "Cannot get the value the subject of the variable of this type.");

        const valueTypeHere: string = typeof subjectValue;
        if (JSON.stringify(this.declaredType) !== JSON.stringify(subjectValue.type))
            return new RuntimeError(this.ctx, "The value " + subjectValue + " does not match the declared type " + this.declaredType);

        return subjectValue.value;
    }
}