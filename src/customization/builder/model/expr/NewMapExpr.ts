import { ArrayType } from "./ArrayExpr";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class MapType {
    public readonly keyType: ValueType | ArrayType | MapType;
    public readonly valueType: ValueType | ArrayType | MapType;
    constructor(keyType: ValueType | ArrayType | MapType, valueType: ValueType | ArrayType | MapType) {
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