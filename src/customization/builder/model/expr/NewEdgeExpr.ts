import { EdgeInfo, NodeInfo } from "../../../../debugmodel/DiagramInfo";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class NewEdgeExpr extends Expr {
    private readonly left: Expr;
    private readonly right: Expr;

    private edge?: EdgeInfo;

    constructor(leftExpr: Expr, rightExpr: Expr) {
        super();
        this.left = leftExpr;
        this.right = rightExpr;
    }
    
    public type(): ValueType {
        return ValueType.EDGE;
    }

    public value(): EdgeInfo {
        if (!this.edge) {
            const source: NodeInfo = this.left.value() as NodeInfo;
            const target: NodeInfo = this.right.value() as NodeInfo;
            this.edge = {
                id: source.id + "-" + target.id,
                source: source.id,
                target: target.id,
                label: 'CUST', // TODO: Add another expr for edge label
                type: 'floating'
            };
        }
        return this.edge;
    }

    public reset(): void {
        this.edge = undefined;
        this.left.reset();
        this.right.reset();
    }
}