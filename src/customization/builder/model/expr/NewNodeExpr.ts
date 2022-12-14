import { RuntimeError } from "../../error/RuntimeError";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class NewNodeExpr extends Expr {
    private readonly nameExpr: Expr;

    constructor(expr: Expr) {
        super();
        this.nameExpr = expr;
    }
    
    public type(): ValueType {
        return ValueType.NODE;
    }

    public eval(): Object {
        const exprValue: Object = this.nameExpr.eval() as Object;
        if (exprValue instanceof RuntimeError) return exprValue;
        const name: string = exprValue as string;

        return {
            id: name,
            position: {x: 0, y:0},
            type: 'object',
            data: {
                title: name,
                rows: []
            }
        };
    }
}