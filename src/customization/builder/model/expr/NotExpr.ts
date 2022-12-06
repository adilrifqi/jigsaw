import { BooleanExpr } from "./BooleanExpr";
import { Expr } from "./Expr";

export class NotExpr extends BooleanExpr {
    private readonly toNot: Expr;

    constructor(toNot: Expr) {
        super();
        this.toNot = toNot;
    }

    public value(): boolean {
        return !(this.toNot.value() as boolean);
    }

    public reset(): void {
        this.toNot.reset();
    }
}