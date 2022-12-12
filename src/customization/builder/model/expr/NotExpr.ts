import { RuntimeError } from "../../error/RuntimeError";
import { BooleanExpr } from "./BooleanExpr";
import { Expr } from "./Expr";

export class NotExpr extends BooleanExpr {
    private readonly toNot: Expr;

    constructor(toNot: Expr) {
        super();
        this.toNot = toNot;
    }

    public value(): Object {
        const toNotValue: Object = this.toNot.value() as Object;
        if (toNotValue instanceof RuntimeError) return toNotValue;
        return !(toNotValue as boolean);
    }

    public reset(): void {
        this.toNot.reset();
    }
}