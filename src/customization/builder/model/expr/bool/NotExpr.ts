import { RuntimeError } from "../../../error/RuntimeError";
import { BooleanExpr } from "./BooleanExpr";
import { Expr } from "../Expr";

export class NotExpr extends BooleanExpr {
    private readonly toNot: Expr;

    constructor(toNot: Expr) {
        super();
        this.toNot = toNot;
    }

    public eval(): Object {
        const toNotValue: Object = this.toNot.eval() as Object;
        if (toNotValue instanceof RuntimeError) return toNotValue;
        return !(toNotValue as boolean);
    }
}