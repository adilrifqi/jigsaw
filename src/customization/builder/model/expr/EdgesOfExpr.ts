import { ParserRuleContext } from "antlr4ts";
import { NodeInfo } from "../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { ArrayType } from "./ArrayExpr";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class EdgesOfExpr extends Expr {
    private readonly originExpr: Expr;
    private readonly targetExpr: Expr;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(originExpr: Expr, targetExpr: Expr, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.originExpr = originExpr;
        this.targetExpr = targetExpr;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public type(): ArrayType {
        return new ArrayType(ValueType.EDGE, 1);
    }

    public eval(): Object {
        const originExprValue: Object | null = this.originExpr.eval();
        if (originExprValue instanceof RuntimeError) return originExprValue;
        if (originExprValue === null) return [];

        const targetExprValue: Object | null = this.targetExpr.eval();
        if (targetExprValue instanceof RuntimeError) return targetExprValue;
        if (targetExprValue === null) return [];

        const origin: NodeInfo | undefined = originExprValue.hasOwnProperty("id") ? this.runtime.getNode((originExprValue as Subject).id) : originExprValue as NodeInfo;
        const target: NodeInfo | undefined = targetExprValue.hasOwnProperty("id") ? this.runtime.getNode((targetExprValue as Subject).id) : targetExprValue as NodeInfo;
        if (origin === undefined || target === undefined) return [];
        return this.runtime.getEdges(origin, target);
    }
}