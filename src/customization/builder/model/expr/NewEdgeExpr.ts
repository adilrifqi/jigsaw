import { ParserRuleContext } from "antlr4ts";
import { EdgeInfo, NodeInfo } from "../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class NewEdgeExpr extends Expr {
    private readonly sourceExpr: Expr;
    private readonly targetExpr: Expr;
    private readonly labelExpr: Expr;
    private readonly ctx: ParserRuleContext;
    private readonly runtime: CustomizationRuntime;

    constructor(sourceExpr: Expr, targetExpr: Expr, labelExpr: Expr, ctx: ParserRuleContext, runtime: CustomizationRuntime) {
        super();
        this.sourceExpr = sourceExpr;
        this.targetExpr = targetExpr;
        this.labelExpr = labelExpr;
        this.ctx = ctx;
        this.runtime = runtime;
    }
    
    public type(): ValueType {
        return ValueType.EDGE;
    }

    public eval(): Object {
        const sourceExprValue: Object | null = this.sourceExpr.eval();
        if (sourceExprValue instanceof RuntimeError) return sourceExprValue;
        if (sourceExprValue === null) return new RuntimeError(this.ctx, "Cannot make an edge from a null node (first argument)");
        const source: NodeInfo | undefined = sourceExprValue.hasOwnProperty("id") ? this.runtime.getNode((sourceExprValue as Subject).id) : sourceExprValue as NodeInfo;
        if (source === undefined) return new RuntimeError(this.ctx, "Cannot make an edge from a null node (second argument)");

        const targetExprValue: Object | null = this.targetExpr.eval();
        if (targetExprValue instanceof RuntimeError) return targetExprValue;
        if (targetExprValue === null) return new RuntimeError(this.ctx, "Cannot make an edge to a null node (second argument)");
        const target: NodeInfo | undefined = targetExprValue.hasOwnProperty("id") ? this.runtime.getNode((targetExprValue as Subject).id) : targetExprValue as NodeInfo;
        if (target === undefined) return new RuntimeError(this.ctx, "Cannot make an edge from a null node (second argument)");

        const labelExprValue: Object = this.labelExpr.eval() as Object;
        if (labelExprValue instanceof RuntimeError) return labelExprValue;
        const label: string = labelExprValue as string;

        const result: EdgeInfo = {
            id: source.id + "-" + target.id,
            source: source.id,
            target: target.id,
            label: label,
            type: 'floating'
        };

        this.runtime.addEdge(result);
        return result;
    }
}