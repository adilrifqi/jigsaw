import { RuntimeError } from "../../error/RuntimeError";
import { Expr } from "./Expr";
import { NumExpr } from "./NumExpr";

export class BinaryNumOp extends NumExpr {
    private readonly leftExpr: Expr;
    private readonly rightExpr: Expr;
    private readonly op: NumOp;

    constructor(left: Expr, right: Expr, op: NumOp) {
        super();
        this.leftExpr = left;
        this.rightExpr = right;
        this.op = op;
    }

    public value(): Object {
        const leftExprValue: Object = this.leftExpr.value() as Object;
        if (leftExprValue instanceof RuntimeError) return leftExprValue;
        const left: number = leftExprValue as number;

        const rightExprValue: Object = this.rightExpr.value() as Object;
        if (rightExprValue instanceof RuntimeError) return rightExprValue;
        const right: number = rightExprValue as number;

        switch(this.op) {
            case NumOp.ADD: return left + right;
            case NumOp.SUB: return left - right;
            case NumOp.MULT: return left * right;
            case NumOp.DIV: return Math.floor(left + right);
        }
    }

    public reset(): void {
        this.leftExpr.reset();
        this.rightExpr.reset();
    }
}

export enum NumOp {
    ADD, SUB, MULT, DIV
}

