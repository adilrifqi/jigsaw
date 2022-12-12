import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { ArrayType } from "./ArrayExpr";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class ArrayAccessExpr extends Expr {
    private readonly arrayExpr: Expr;
    private readonly indexExpr: Expr;
    private readonly ctx: ParserRuleContext;

    constructor(arrayExpr: Expr, indexExpr: Expr, ctx: ParserRuleContext) {
        super();
        this.arrayExpr = arrayExpr;
        this.indexExpr = indexExpr;
        this.ctx = ctx;
    }

    public type(): ValueType | ArrayType {
        const arrayType: ArrayType = this.arrayExpr.type() as ArrayType;
        if (arrayType.dimension <= 1) return arrayType.type;
        return {type: arrayType.type, dimension: arrayType.dimension - 1};
    }

    public value(): Object | null {
        const arrayExprValue: Object = this.arrayExpr.value() as Object;
        if (arrayExprValue instanceof RuntimeError) return arrayExprValue;
        const array: (Object | null)[] = arrayExprValue as (Object | null)[];

        const indexExprValue: Object = this.indexExpr.value() as Object;
        if (indexExprValue instanceof RuntimeError) return indexExprValue;
        const index: number = indexExprValue as number;

        if (index > array.length - 1 || index < 0)
            return new RuntimeError(this.ctx, "Index out of bounds, index" + index + " to an array of size " + array.length);

        return array[index];
    }

    public reset(): void {
        this.arrayExpr.reset();
        this.indexExpr.reset();
    }
}