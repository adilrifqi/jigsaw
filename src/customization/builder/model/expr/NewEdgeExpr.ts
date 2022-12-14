import { ParserRuleContext } from "antlr4ts";
import { EdgeInfo, NodeInfo } from "../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../error/RuntimeError";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class NewEdgeExpr extends Expr {
    private readonly sourceExpr: Expr;
    private readonly targetExpr: Expr;
    private readonly labelExpr: Expr;
    private readonly ctx: ParserRuleContext;

    constructor(sourceExpr: Expr, targetExpr: Expr, labelExpr: Expr, ctx: ParserRuleContext) {
        super();
        this.sourceExpr = sourceExpr;
        this.targetExpr = targetExpr;
        this.labelExpr = labelExpr;
        this.ctx = ctx;
    }
    
    public type(): ValueType {
        return ValueType.EDGE;
    }

    public eval(): Object {
        const sourceExprValue: Object | null = this.sourceExpr.eval();
        if (sourceExprValue instanceof RuntimeError) return sourceExprValue;
        if (sourceExprValue === null) return new RuntimeError(this.ctx, "Cannot make an edge from a null node");
        const source: NodeInfo = sourceExprValue as NodeInfo;

        const targetExprValue: Object | null = this.targetExpr.eval();
        if (targetExprValue instanceof RuntimeError) return targetExprValue;
        if (targetExprValue === null) return new RuntimeError(this.ctx, "Cannot make an edge to a null node");
        const target: NodeInfo = targetExprValue as NodeInfo;

        const labelExprValue: Object = this.labelExpr.eval() as Object;
        if (labelExprValue instanceof RuntimeError) return labelExprValue;
        const label: string = labelExprValue as string;

        return {
            id: source.id + "-" + target.id,
            source: source.id,
            target: target.id,
            label: label,
            type: 'floating'
        };
    }
}