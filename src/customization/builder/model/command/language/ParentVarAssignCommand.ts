import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../../error/RuntimeError";
import { CustomizationRuntime } from "../../CustomizationRuntime";
import { ArrayType } from "../../expr/collection/ArrayExpr";
import { MapType } from "../../expr/collection/NewMapExpr";
import { Expr } from "../../expr/Expr";
import { ValueType } from "../../expr/ValueType";
import { Command } from "./Command";

export class ParentVarAssignCommand extends Command {
    private readonly varName: string;
    private readonly upwardCount: number;
    private readonly expr: Expr;
    private readonly type: ValueType | ArrayType | MapType;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(varName: string, upwardCount: number, expr: Expr, type: ValueType | ArrayType | MapType, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
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

        if (this.type != ValueType.NODE && this.type != ValueType.EDGE && exprValue === null)
            return new RuntimeError(this.ctx, "Cannot assign null to this type");

        if (!this.runtime.updateAncestorLocationVariable(this.varName, this.upwardCount, exprValue, this.type))
            return new RuntimeError(this.ctx, "Runtime error: variable with the name '" + this.varName + " does not exist in the target scope (though this should not have happened)");
    }
}