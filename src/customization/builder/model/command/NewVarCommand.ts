import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { ArrayType } from "../expr/ArrayExpr";
import { Expr } from "../expr/Expr";
import { MapType } from "../expr/NewMapExpr";
import { ValueType } from "../expr/ValueType";
import { Command } from "./Command";

export class NewVarCommand extends Command {
    private readonly varName: string;
    private readonly expr: Expr;
    private readonly type: ValueType | ArrayType | MapType;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(varName: string, expr: Expr, type: ValueType | ArrayType | MapType, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.varName = varName;
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

        if (!this.runtime.addVarible(
            this.varName,
            this.type,
            exprValue
        )) return new RuntimeError(this.ctx, "For some reason, variable with the same name already exists in this scope in runtime.");
    }
}