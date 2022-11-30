import { BooleanExpr } from "./BooleanExpr";
import { Expr } from "./Expr";

export class ComparisonExpr extends BooleanExpr {
    private readonly left: Expr;
    private readonly right: Expr;
    private readonly op: CompOp;

    constructor(left: Expr, right: Expr, op: CompOp) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
    }
    
    public value(): boolean {
        // Assume correct typing left and right
        // Only possible types are char or int
        // TODO: Confirm that this works as intended
        switch (this.op) {
            case CompOp.LESS: return this.left.value()!! < this.right.value()!!;
            case CompOp.LEQ: return this.left.value()!! <= this.right.value()!!;
            case CompOp.EQUAL: return this.left.value()!! == this.right.value()!!;
            case CompOp.NEQ: return this.left.value()!! != this.right.value()!!;
            case CompOp.GEQ: return this.left.value()!! >= this.right.value()!!;
            case CompOp.GREATER: return this.left.value()!! > this.right.value()!!;
        }
    }

    public initialize(): void {
        this.left.initialize();
        this.right.initialize();
    }
}

export enum CompOp {
    LESS, LEQ, EQUAL, NEQ, GEQ, GREATER
}