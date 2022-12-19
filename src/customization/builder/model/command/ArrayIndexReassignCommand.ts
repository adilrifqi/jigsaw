import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Expr } from "../expr/Expr";
import { Location } from "../location/Location";
import { Command } from "./Command";

export class ArrayIndexReassignCommand extends Command {
    private readonly arrayExpr: Expr;
    private readonly indexExprs: Expr[];
    private readonly newValueExpr: Expr;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(arrayExpr: Expr, indexExprs: Expr[], newValueExpr: Expr, runtime: CustomizationRuntime, location: Location, ctx: ParserRuleContext) {
        super(location);
        this.arrayExpr = arrayExpr;
        this.indexExprs = indexExprs;
        this.newValueExpr = newValueExpr;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public execute(): RuntimeError | undefined {
        const arrayResult: Object = this.arrayExpr.eval() as Object;
        if (arrayResult instanceof RuntimeError) return arrayResult;
        const array: (Object | null)[] = arrayResult as (Object | null)[];

        const indices: number[] = [];
        for (const indexExpr of this.indexExprs) {
            const indexResult: Object = indexExpr.eval() as Object;
            if (indexResult instanceof RuntimeError) return indexResult;
            indices.push(indexResult as number);
        }

        const newValueResult: Object | null = this.newValueExpr.eval();
        if (newValueResult instanceof RuntimeError) return newValueResult;

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