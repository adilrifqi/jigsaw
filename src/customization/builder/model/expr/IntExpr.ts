import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export abstract class IntExpr extends Expr {
    public type(): ValueType {
        return ValueType.INT;
    }

    public abstract value(): number;
}