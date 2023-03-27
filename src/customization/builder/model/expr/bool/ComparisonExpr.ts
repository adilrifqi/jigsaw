import { RuntimeError } from "../../../error/RuntimeError";
import { Expr } from "../Expr";
import { BooleanExpr } from "./BooleanExpr";

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
    
    public eval(): Object {
        // Assume correct typing left and right
        const leftExprValue: Object = this.leftExpr.eval() as Object;
        if (leftExprValue instanceof RuntimeError) return leftExprValue;

        const rightExprValue: Object = this.rightExpr.eval() as Object;
        if (rightExprValue instanceof RuntimeError) return rightExprValue;

        switch (this.op) {
            case CompOp.LESS: return leftExprValue < rightExprValue;
            case CompOp.LEQ: return leftExprValue <= rightExprValue;
            case CompOp.EQUAL: return JSON.stringify(leftExprValue) === JSON.stringify(rightExprValue);
            case CompOp.NEQ: return JSON.stringify(leftExprValue) !== JSON.stringify(rightExprValue);
            case CompOp.GEQ: return leftExprValue >= rightExprValue;
            case CompOp.GREATER: return leftExprValue > rightExprValue;
        }
    }
}

export enum CompOp {
    LESS, LEQ, EQUAL, NEQ, GEQ, GREATER
}