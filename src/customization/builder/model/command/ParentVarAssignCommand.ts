import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { ArrayType } from "../expr/ArrayExpr";
import { Expr } from "../expr/Expr";
import { ValueType } from "../expr/ValueType";
import { Location } from "../location/Location";
import { Command } from "./Command";

export class ParentVarAssignCommand extends Command {
    private readonly varName: string;
    private readonly upwardCount: number;
    private readonly expr: Expr;
    private readonly type: ValueType | ArrayType;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(varName: string, upwardCount: number, expr: Expr, type: ValueType | ArrayType, runtime: CustomizationRuntime, ctx: ParserRuleContext, location?: Location) {
        super(location);
        this.varName = varName;
        this.upwardCount = upwardCount;
        this.expr = expr;
        this.type = type;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public execute(): RuntimeError | undefined {
        const exprValue: Object | null = this.expr.eval();
        if (exprValue instanceof RuntimeError) return exprValue;

        if (!this.runtime.updateAncestorLocationVariable(this.varName, this.upwardCount, exprValue, this.type))
            return new RuntimeError(this.ctx, "Runtime error: variable with the name '" + this.varName + " does not exist in the target scope (though this should not have happened)");
    }
}