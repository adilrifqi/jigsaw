import { RuntimeError } from "../../error/RuntimeError";
import { BooleanExpr } from "./BooleanExpr";
import { Expr } from "./Expr";

export class ComparisonExpr extends BooleanExpr {
    private readonly leftExpr: Expr;
    private readonly rightExpr: Expr;
    private readonly op: CompOp;

    constructor(left: Expr, right: Expr, op: CompOp) {
        super();
        this.leftExpr = left;
        this.rightExpr = right;
        this.op = op;
    }
    
    public value(): Object {
        // Assume correct typing left and right
        // Only possible types are char or int
        const leftExprValue: Object = this.leftExpr.value() as Object;
        if (leftExprValue instanceof RuntimeError) return leftExprValue;

        const rightExprValue: Object = this.rightExpr.value() as Object;
        if (rightExprValue instanceof RuntimeError) return rightExprValue;

        switch (this.op) {
            case CompOp.LESS: return leftExprValue < rightExprValue;
            case CompOp.LEQ: return leftExprValue <= rightExprValue;
            case CompOp.EQUAL: return leftExprValue == rightExprValue;
            case CompOp.NEQ: return leftExprValue != rightExprValue;
            case CompOp.GEQ: return leftExprValue >= rightExprValue;
            case CompOp.GREATER: return leftExprValue > rightExprValue;
        }
    }

    public reset(): void {
        this.leftExpr.reset();
        this.rightExpr.reset();
    }
}

export enum CompOp {
    LESS, LEQ, EQUAL, NEQ, GEQ, GREATER
}