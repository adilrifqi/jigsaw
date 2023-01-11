import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class NodeOfExpr extends Expr {
    private readonly subjectExpr: Expr;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(subjectExpr: Expr, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.subjectExpr = subjectExpr;
        this.runtime = runtime;
        this.ctx = ctx;
    }
    
    public type(): ValueType {
        return ValueType.NODE;
    }

    public eval(): Object | null {
        const subjectExpr: Object = this.subjectExpr.eval() as Object;
        if (subjectExpr instanceof RuntimeError) return subjectExpr;
        if (subjectExpr === null) return null;
        const subject: Subject = subjectExpr as Subject;
        return this.runtime.getSubjectNode(subject);
    }
}