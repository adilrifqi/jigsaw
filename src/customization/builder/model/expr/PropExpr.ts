import { ParserRuleContext } from "antlr4ts";
import { EdgeInfo } from "../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { ArrayType } from "./ArrayExpr";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class PropExpr extends Expr {
    private readonly proppedExpr: Expr;
    private readonly prop: string;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;
    private readonly isSubjectProp: boolean;

    constructor(proppedExpr: Expr, prop: string, runtime: CustomizationRuntime, ctx: ParserRuleContext, isSubjectProp: boolean = false) {
        super();
        this.proppedExpr = proppedExpr;
        this.prop = prop;
        this.runtime = runtime;
        this.ctx = ctx;
        this.isSubjectProp = isSubjectProp;
    }

    public type(): ValueType | ArrayType {
        if (this.isSubjectProp) return ValueType.SUBJECT;

        switch (this.prop) {
            case "length":
                return ValueType.NUM;
            case "label":
                return ValueType.STRING;
            default:
                return ValueType.NUM;
        }
    }

    public eval(): Object {
        const proppedValue: Object | null = this.proppedExpr.eval();
        if (proppedValue instanceof RuntimeError) return proppedValue;
        if (proppedValue === null) return new RuntimeError(this.ctx, "Cannot access property of null");

        if (this.isSubjectProp) {
            const fieldSubject: Subject | null = this.runtime.getFieldOfName(proppedValue as Subject, this.prop);
            if (fieldSubject === null)
                return new RuntimeError(this.ctx, "Field with name " + this.prop + " does not exist in this location scope.");
            return fieldSubject as Subject;
        } else
            switch (this.prop) {
                case "length":
                    return (proppedValue as any[]).length;
                case "label":
                    return (proppedValue as EdgeInfo).label;
                default:
                    return new RuntimeError(this.ctx, "Somehow the invalid property " + this.prop + " passed type-checking.");
            }
    }
}