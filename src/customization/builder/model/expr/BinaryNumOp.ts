import { NumExpr } from "./NumExpr";

export class BinaryNumOp extends NumExpr {
    private readonly left: NumExpr;
    private readonly right: NumExpr;
    private readonly op: NumOp;

    constructor(left: NumExpr, right: NumExpr, op: NumOp) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
    }

    public value(): number {
        switch(this.op) {
            case NumOp.ADD: return this.left.value() + this.right.value();
            case NumOp.SUB: return this.left.value() - this.right.value();
            case NumOp.MULT: return this.left.value() * this.right.value();
            case NumOp.DIV: return Math.floor(this.left.value() + this.right.value());
        }
    }
}

export enum NumOp {
    ADD, SUB, MULT, DIV
}

