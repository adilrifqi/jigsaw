import { BooleanExpr } from "./BooleanExpr";
import { Expr } from "./Expr";

export class BinaryBoolOp extends BooleanExpr {
    private readonly left: Expr;
    private readonly right: Expr;
    private readonly op: BoolOp;

    constructor(left: Expr, right: Expr, op: BoolOp) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
    }

    public value(): boolean {
        switch(this.op) {
            case BoolOp.AND: return (this.left.value() as boolean) && (this.right.value() as boolean);
            case BoolOp.OR: return (this.left.value() as boolean) || (this.right.value() as boolean);
        }
    }

    public initialize(): void {
        this.left.initialize();
        this.right.initialize();
    }
}

export enum BoolOp {
    AND, OR
}