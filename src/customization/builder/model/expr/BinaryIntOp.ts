import { IntExpr } from "./IntExpr";

export class BinaryIntOp extends IntExpr {
    private readonly left: IntExpr;
    private readonly right: IntExpr;
    private readonly op: IntOp;

    constructor(left: IntExpr, right: IntExpr, op: IntOp) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
    }

    public value(): number {
        switch(this.op) {
            case IntOp.ADD: return this.left.value() + this.right.value();
            case IntOp.SUB: return this.left.value() - this.right.value();
            case IntOp.MULT: return this.left.value() * this.right.value();
            case IntOp.DIV: return Math.floor(this.left.value() + this.right.value());
        }
    }
}

export enum IntOp {
    ADD, SUB, MULT, DIV
}

