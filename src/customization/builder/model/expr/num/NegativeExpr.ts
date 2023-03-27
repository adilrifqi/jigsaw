import { RuntimeError } from "../../../error/RuntimeError";
import { Expr } from "../Expr";
import { NumExpr } from "./NumExpr";

export class NegativeExpr extends NumExpr {
    private readonly toNegate: Expr;

    constructor(toNegate: Expr) {
        super();
        this.toNegate = toNegate;
    }

    public eval(): Object {
        const toNegateValue: Object = this.toNegate.eval() as Object;
        if (toNegateValue instanceof RuntimeError) return toNegateValue;
        return -(toNegateValue as number);
    }
}