import { RuntimeError } from "../../error/RuntimeError";
import { BooleanExpr } from "./BooleanExpr";
import { Expr } from "./Expr";

export class BinaryBoolOp extends BooleanExpr {
    private readonly leftExpr: Expr;
    private readonly rightExpr: Expr;
    private readonly op: BoolOp;

    constructor(left: Expr, right: Expr, op: BoolOp) {
        super();
        this.leftExpr = left;
        this.rightExpr = right;
        this.op = op;
    }

    public value(): Object {
        const leftExprValue: Object = this.leftExpr.value() as Object;
        if (leftExprValue instanceof RuntimeError) return leftExprValue;
        const left: boolean = leftExprValue as boolean;

        const rightExprValue: Object = this.rightExpr.value() as Object;
        if (rightExprValue instanceof RuntimeError) return rightExprValue;
        const right: boolean = rightExprValue as boolean;

        switch(this.op) {
            case BoolOp.AND: return left && right;
            case BoolOp.OR: return left || right;
        }
    }

    public reset(): void {
        this.leftExpr.reset();
        this.rightExpr.reset();
    }
}

export enum BoolOp {
    AND, OR
}