import { CustSpecComponent } from "../CustSpecComponent";
import { ValueType } from "./ValueType";

export abstract class Expr extends CustSpecComponent {
    public abstract type(): ValueType | null;
    public abstract value(): Object | null;
    public abstract initialize(): void;
}