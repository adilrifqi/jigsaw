import { Command } from "./Command";
import { ParserRuleContext } from "antlr4ts";
import { Expr } from "../../expr/Expr";
import { CustomizationRuntime } from "../../CustomizationRuntime";
import { RuntimeError } from "../../../error/RuntimeError";
import { ValueType } from "../../expr/ValueType";
import { ArrayType } from "../../expr/collection/ArrayExpr";
import { MapType } from "../../expr/collection/NewMapExpr";

export class ReassignCommand extends Command {
    private readonly varName: string;
    private readonly expr: Expr;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(varName: string, expr: Expr, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.varName = varName;
        this.expr = expr;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public execute(): RuntimeError | undefined {
        const exprValue: Object | null = this.expr.eval();
        if (exprValue instanceof RuntimeError) return exprValue;
        const exprType: ValueType | ArrayType | MapType = this.expr.type();

        if (exprType != ValueType.NODE && exprType != ValueType.EDGE && exprValue === null)
            return new RuntimeError(this.ctx, "Cannot assign null to this type");

        if (!this.runtime.reassignVariable(this.varName, exprType, exprValue))
            return new RuntimeError(this.ctx, "For some reason, reassigning to non-existant variable in runtime.");
        return undefined;
    }
}