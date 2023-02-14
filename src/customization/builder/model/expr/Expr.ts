import { CustSpecComponent } from "../CustSpecComponent";
import { ArrayType } from "./ArrayExpr";
import { MapType } from "./NewMapExpr";
import { ValueType } from "./ValueType";

export abstract class Expr extends CustSpecComponent {
    public abstract type(): ValueType | ArrayType | MapType;
    public abstract eval(): Object | null;
}