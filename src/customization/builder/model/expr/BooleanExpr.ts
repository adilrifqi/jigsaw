import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export abstract class BooleanExpr extends Expr {
    public type(): ValueType {
        return ValueType.BOOLEAN;
    }

    public abstract eval(): Object;
}