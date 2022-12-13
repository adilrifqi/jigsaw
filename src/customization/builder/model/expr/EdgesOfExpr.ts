import { NodeInfo } from "../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { ArrayType } from "./ArrayExpr";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class EdgesOfExpr extends Expr {
    private readonly originExpr: Expr;
    private readonly targetExpr: Expr;
    private readonly runtime: CustomizationRuntime;

    constructor(originExpr: Expr, targetExpr: Expr, runtime: CustomizationRuntime) {
        super();
        this.originExpr = originExpr;
        this.targetExpr = targetExpr;
        this.runtime = runtime;
    }

    public type(): ArrayType {
        return {type: ValueType.EDGE, dimension: 1};
    }

    public eval(): Object {
        const originExprValue: Object | null = this.originExpr.eval();
        if (originExprValue instanceof RuntimeError) return originExprValue;

        const targetExprValue: Object | null = this.targetExpr.eval();
        if (targetExprValue instanceof RuntimeError) return targetExprValue;

        if (originExprValue !== null && targetExprValue !== null) {
            const origin: NodeInfo = originExprValue as NodeInfo;
            const target: NodeInfo = targetExprValue as NodeInfo;
            return this.runtime.getEdges(origin, target);
        }

        return []; // TODO: Return empty or RuntimeError?
    }
}