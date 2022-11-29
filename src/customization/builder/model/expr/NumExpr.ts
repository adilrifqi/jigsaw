import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export abstract class NumExpr extends Expr {
    public type(): ValueType {
        return ValueType.NUM;
    }

    public abstract value(): number;
}