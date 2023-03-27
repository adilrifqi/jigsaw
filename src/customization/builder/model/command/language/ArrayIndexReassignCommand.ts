import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../../error/RuntimeError";
import { CustomizationRuntime } from "../../CustomizationRuntime";
import { ArrayType } from "../../expr/collection/ArrayExpr";
import { MapType } from "../../expr/collection/NewMapExpr";
import { Expr } from "../../expr/Expr";
import { ValueType } from "../../expr/ValueType";
import { Command } from "./Command";

export class ArrayIndexReassignCommand extends Command {
    private readonly arrayExpr: Expr;
    private readonly indexExprs: Expr[];
    private readonly newValueExpr: Expr;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(arrayExpr: Expr, indexExprs: Expr[], newValueExpr: Expr, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.arrayExpr = arrayExpr;
        this.indexExprs = indexExprs;
        this.newValueExpr = newValueExpr;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public execute(): RuntimeError | undefined {
        const arrayResult: Object | null = this.arrayExpr.eval();
        if (arrayResult === null) return new RuntimeError(this.ctx, "null as array.");
        if (arrayResult instanceof RuntimeError) return arrayResult;
        const array: (Object | null)[] = arrayResult as (Object | null)[];

        const indices: number[] = [];
        for (const indexExpr of this.indexExprs) {
            const indexResult: Object | null = indexExpr.eval();
            if (indexResult === null) return new RuntimeError(this.ctx, "null as index.");
            if (indexResult instanceof RuntimeError) return indexResult;
            indices.push(indexResult as number);
        }

        const newValueResult: Object | null = this.newValueExpr.eval();
        if (newValueResult instanceof RuntimeError) return newValueResult;

        const arrayType: ArrayType = this.arrayExpr.type() as ArrayType;
        const targetType: ValueType | ArrayType | MapType
            = this.indexExprs.length >= arrayType.dimension
            ? arrayType.type!
            : new ArrayType(arrayType.type, arrayType.dimension - this.indexExprs.length);
        if (targetType != ValueType.NODE && targetType != ValueType.EDGE && newValueResult === null)
            return new RuntimeError(this.ctx, "Cannot assign null as an element");

        var currentArray: (Object | null)[] = array;
        for (var i = 0; i < indices.length - 1; i++) {
            const index: number = indices[i];
            if (index > currentArray.length - 1 || index < 0)
                return new RuntimeError(this.ctx, "The index " + index + " given at order " + (i + 1) + " is out of bounds.");
            currentArray = currentArray[index] as (Object | null)[];
        }

        const finalIndex: number = indices[indices.length - 1];
        if (finalIndex > currentArray.length - 1 || finalIndex < 0)
            return new RuntimeError(this.ctx, "The index " + finalIndex + " given at order " + indices.length + " is out of bounds.");
        currentArray[finalIndex] = newValueResult; // The actual reassignment

        return undefined;
    }
}