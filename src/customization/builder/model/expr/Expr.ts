import { CustSpecComponent } from "../CustSpecComponent";
import { ArrayType } from "./ArrayExpr";
import { ValueType } from "./ValueType";

export abstract class Expr extends CustSpecComponent {
    public abstract type(): ValueType | ArrayType;
    public abstract value(): Object | null;
    public abstract reset(): void;
}