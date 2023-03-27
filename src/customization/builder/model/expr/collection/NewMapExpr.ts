import { Expr } from "../Expr";
import { ValueType } from "../ValueType";
import { ArrayType } from "./ArrayExpr";

export class MapType {
    public readonly keyType: ValueType | ArrayType | MapType | undefined;
    public readonly valueType: ValueType | ArrayType | MapType | undefined;
    constructor(keyType: ValueType | ArrayType | MapType | undefined, valueType: ValueType | ArrayType | MapType | undefined) {
        this.keyType = keyType;
        this.valueType = valueType;
    }
}

export class NewMapExpr extends Expr {
    private readonly mapType: MapType;
    private readonly map: Map<Object, Object | null>;

    constructor(mapType: MapType) {
        super();
        this.mapType = mapType;
        this.map = new Map();
    }

    public type(): MapType {
        return this.mapType;
    }

    public eval(): Object {
        return this.map;
    }
}