import { Expr } from "./Expr";
import { NumExpr } from "./NumExpr";

export class BinaryNumOp extends NumExpr {
    private readonly left: Expr;
    private readonly right: Expr;
    private readonly op: NumOp;

    constructor(left: Expr, right: Expr, op: NumOp) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
    }

    public value(): number {
        switch(this.op) {
            case NumOp.ADD: return (this.left.value() as number) + (this.right.value() as number);
            case NumOp.SUB: return (this.left.value() as number) - (this.right.value() as number);
            case NumOp.MULT: return (this.left.value() as number) * (this.right.value() as number);
            case NumOp.DIV: return Math.floor((this.left.value() as number) + (this.right.value() as number));
        }
    }

    public initialize(): void {
        this.left.initialize();
        this.right.initialize();
    }
}

export enum NumOp {
    ADD, SUB, MULT, DIV
}

