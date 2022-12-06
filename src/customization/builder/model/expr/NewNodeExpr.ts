import { NodeInfo } from "../../../../debugmodel/DiagramInfo";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class NewNodeExpr extends Expr {
    private nodeValue?: NodeInfo;
    private readonly expr: Expr;

    constructor(expr: Expr) {
        super();
        this.expr = expr;
    }
    
    public type(): ValueType {
        return ValueType.NODE;
    }

    public value(): NodeInfo {
        if (!this.nodeValue) {
            const exprValue: string = this.expr.value() as string;
            this.nodeValue = {
                id: exprValue,
                position: {x: 0, y:0},
                type: 'object',
                data: {
                    title: exprValue,
                    rows: []
                }
            };
        }
        return this.nodeValue;
    }

    public reset(): void {
        this.nodeValue = undefined;
        this.expr.reset();
    }
}