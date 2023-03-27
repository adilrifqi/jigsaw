import { CustSpecComponent } from "../CustSpecComponent";
import { ArrayType } from "./collection/ArrayExpr";
import { MapType } from "./collection/NewMapExpr";
import { ValueType } from "./ValueType";

export abstract class Expr extends CustSpecComponent {
    public abstract type(): ValueType | ArrayType | MapType;
    public abstract eval(): Object | null;
}