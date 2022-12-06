import { CustSpecComponent } from "../CustSpecComponent";
import { ValueType } from "./ValueType";

export abstract class Expr extends CustSpecComponent {
    public abstract type(): ValueType;
    public abstract value(): Object | null;
    public abstract reset(): void;
}