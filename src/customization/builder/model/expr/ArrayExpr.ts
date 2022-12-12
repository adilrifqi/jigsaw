import { RuntimeError } from "../../error/RuntimeError";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export type ArrayType = {
    type: ValueType,
    dimension: number
};

export class ArrayExpr extends Expr {
    private readonly contents: Expr[];
    private readonly arrayType: ArrayType;

    constructor(contents: Expr[], arrayType?: ArrayType) {
        super();
        this.contents = contents;
        if (arrayType) this.arrayType = arrayType;
        else if (this.contents.length == 0) this.arrayType = {type: ValueType.NUM, dimension: 0};
        else {
            // throw new Error("Array type must be provided for arrays of non-zero length.");
            const elementType: ValueType | ArrayType = this.contents[0].type();
            if (elementType as any in ValueType) this.arrayType = {type: elementType as ValueType, dimension: 1};
            else {
                const elementArrayType: ArrayType = elementType as ArrayType;
                this.arrayType = {type: elementArrayType.type, dimension: elementArrayType.dimension + 1};
            }
        }
    }

    public type(): ArrayType {
        return this.arrayType;
    }

    public value(): Object {
        const result: (Object | null)[] = [];
        for (const expr of this.contents) {
            const exprValue: Object | null = expr.value();
            if (exprValue instanceof RuntimeError) return exprValue;
            result.push(exprValue);
        }
        return result;
    }

    public reset(): void {
        for (const expr of this.contents)
            expr.reset();
    }
}