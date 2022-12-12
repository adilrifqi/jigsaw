import { NodeInfo } from "../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../error/RuntimeError";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class NewNodeExpr extends Expr {
    private nodeValue?: NodeInfo;
    private readonly nameExpr: Expr;

    constructor(expr: Expr) {
        super();
        this.nameExpr = expr;
    }
    
    public type(): ValueType {
        return ValueType.NODE;
    }

    public value(): Object {
        if (!this.nodeValue) {
            const exprValue: Object = this.nameExpr.value() as Object;
            if (exprValue instanceof RuntimeError) return exprValue;
            const name: string = exprValue as string;

            this.nodeValue = {
                id: name,
                position: {x: 0, y:0},
                type: 'object',
                data: {
                    title: name,
                    rows: []
                }
            };
        }
        return this.nodeValue;
    }

    public reset(): void {
        this.nodeValue = undefined;
        this.nameExpr.reset();
    }
}