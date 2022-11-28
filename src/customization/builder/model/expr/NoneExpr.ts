import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class NoneExpr extends Expr {
    public type(): null {
        return null;
    }

    public value(): null {
        return null;
    }
}