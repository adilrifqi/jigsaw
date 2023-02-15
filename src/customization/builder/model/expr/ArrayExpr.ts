import { RuntimeError } from "../../error/RuntimeError";
import { Expr } from "./Expr";
import { MapType } from "./NewMapExpr";
import { ValueType } from "./ValueType";

export class ArrayType {
    public readonly type: ValueType | MapType;
    public readonly dimension: number;
    constructor(type: ValueType | MapType, dimension: number) {
        this.type = type;
        this.dimension = dimension;
    }
}

export class ArrayExpr extends Expr {
    private readonly contents: Expr[];
    private readonly arrayType: ArrayType;

    constructor(contents: Expr[], arrayType?: ArrayType) {
        super();
        this.contents = contents;
        if (arrayType) this.arrayType = arrayType;
        else if (this.contents.length == 0) this.arrayType = new ArrayType(ValueType.NUM, 0);
        else {
            const elementType: ValueType | ArrayType | MapType = this.contents[0].type();
            if (elementType instanceof ArrayType) {
                const elementArrayType: ArrayType = elementType as ArrayType;
                this.arrayType = new ArrayType(elementArrayType.type, elementArrayType.dimension + 1);
            } else this.arrayType = new ArrayType(elementType as ValueType | MapType, 1);
        }
    }

    public type(): ArrayType {
        return this.arrayType;
    }

    public eval(): Object {
        const result: (Object | null)[] = [];
        for (const expr of this.contents) {
            const exprValue: Object | null = expr.eval();
            if (exprValue instanceof RuntimeError) return exprValue;
            result.push(exprValue);
        }
        return result;
    }
}