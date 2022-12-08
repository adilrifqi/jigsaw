import { EdgeInfo, NodeInfo } from "../../../../debugmodel/DiagramInfo";
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

    public value(): EdgeInfo {
        if (!this.edge) {
            const source: NodeInfo = this.sourceExpr.value() as NodeInfo;
            const target: NodeInfo = this.targetExpr.value() as NodeInfo;
            const label: string = this.labelExpr.value() as string;
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