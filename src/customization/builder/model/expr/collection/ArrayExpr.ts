import { RuntimeError } from "../../../error/RuntimeError";
import { Expr } from "../Expr";
import { ValueType } from "../ValueType";
import { MapType } from "./NewMapExpr";

export class ArrayType {
    public readonly type: ValueType | MapType | undefined;
    public readonly dimension: number;
    constructor(type: ValueType | MapType | undefined, dimension: number) {
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
        else this.arrayType = ArrayExpr.extractArrayType(contents);
    }

    public static extractArrayType(contents: Expr[]): ArrayType {
        if (contents.length == 0) return new ArrayType(undefined, 1);

        var highestUndefinedArrayType: ArrayType | undefined = undefined;
        for (const expr of contents) {
            const currentInnerType: ValueType | ArrayType | MapType = expr.type();
            if (currentInnerType as any in ValueType) return new ArrayType(currentInnerType as ValueType, 1);
            if (currentInnerType instanceof MapType) return new ArrayType(currentInnerType as MapType, 1);

            const currentInnerArrayType: ArrayType = currentInnerType as ArrayType;
            if (currentInnerArrayType.type === undefined) {
                if (highestUndefinedArrayType === undefined) highestUndefinedArrayType = new ArrayType(undefined, currentInnerArrayType.dimension + 1);
                else if (currentInnerArrayType.dimension > highestUndefinedArrayType.dimension) highestUndefinedArrayType = currentInnerArrayType;
            }
            else return new ArrayType(currentInnerArrayType.type, currentInnerArrayType.dimension + 1);
        }

        return highestUndefinedArrayType!;
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