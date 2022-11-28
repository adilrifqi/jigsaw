import { BooleanExpr } from "./BooleanExpr";

export class BinaryBoolOp extends BooleanExpr {
    private readonly left: BooleanExpr;
    private readonly right: BooleanExpr;
    private readonly op: BoolOp;

    constructor(left: BooleanExpr, right: BooleanExpr, op: BoolOp) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
    }

    public value(): boolean {
        switch(this.op) {
            case BoolOp.AND: return this.left.value() && this.right.value();
            case BoolOp.OR: return this.left.value() || this.right.value();
        }
    }
}

export enum BoolOp {
    AND, OR
}