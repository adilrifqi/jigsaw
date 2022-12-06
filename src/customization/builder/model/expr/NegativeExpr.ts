import { Expr } from "./Expr";
import { NumExpr } from "./NumExpr";

export class NegativeExpr extends NumExpr {
    private readonly toNegate: Expr;

    constructor(toNegate: Expr) {
        super();
        this.toNegate = toNegate;
    }

    public value(): number {
        return -(this.toNegate.value() as number);
    }

    public reset(): void {
        this.toNegate.reset();
    }
}