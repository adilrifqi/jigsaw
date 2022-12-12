import { EdgeInfo, NodeInfo } from "../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../error/RuntimeError";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class NewEdgeExpr extends Expr {
    private readonly sourceExpr: Expr;
    private readonly targetExpr: Expr;
    private readonly labelExpr: Expr;

    private edge?: EdgeInfo;

    constructor(sourceExpr: Expr, targetExpr: Expr, labelExpr: Expr) {
        super();
        this.sourceExpr = sourceExpr;
        this.targetExpr = targetExpr;
        this.labelExpr = labelExpr;
    }
    
    public type(): ValueType {
        return ValueType.EDGE;
    }

    public value(): Object | null {
        if (!this.edge) {
            const sourceExprValue: Object | null = this.sourceExpr.value();
            if (sourceExprValue instanceof RuntimeError) return sourceExprValue;
            if (sourceExprValue === null) return null;
            const source: NodeInfo = sourceExprValue as NodeInfo;

            const targetExprValue: Object | null = this.targetExpr.value();
            if (targetExprValue instanceof RuntimeError) return targetExprValue;
            if (targetExprValue === null) return null;
            const target: NodeInfo = targetExprValue as NodeInfo;

            const labelExprValue: Object = this.labelExpr.value() as Object;
            if (labelExprValue instanceof RuntimeError) return labelExprValue;
            const label: string = labelExprValue as string;

            this.edge = {
                id: source.id + "-" + target.id,
                source: source.id,
                target: target.id,
                label: label,
                type: 'floating'
            };
        }
        return this.edge;
    }

    public reset(): void {
        this.edge = undefined;
        this.sourceExpr.reset();
        this.targetExpr.reset();
        this.labelExpr.reset();
    }
}