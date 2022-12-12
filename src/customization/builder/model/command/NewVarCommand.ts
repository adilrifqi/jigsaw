import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { ArrayType } from "../expr/ArrayExpr";
import { Expr } from "../expr/Expr";
import { ValueType } from "../expr/ValueType";
import { Location } from "../location/Location";
import { Command } from "./Command";

export class NewVarCommand extends Command {
    private readonly varName: string;
    private readonly expr: Expr;
    private readonly type: ValueType | ArrayType;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(varName: string, expr: Expr, type: ValueType | ArrayType, runtime: CustomizationRuntime, location: Location, ctx: ParserRuleContext) {
        super(location);
        this.varName = varName;
        this.expr = expr;
        this.type = type;
        this.runtime = runtime;
        this.ctx = ctx;
    }
    
    public execute(): RuntimeError | undefined {
        this.expr.reset();
        const exprValue: Object | null = this.expr.value();
        if (exprValue instanceof RuntimeError) return exprValue;

        if (this.runtime.addVarible(
            this.varName,
            this.type,
            exprValue
        )) return new RuntimeError(this.ctx, "For some reason, variable with the same name already exists in this scope in runtime.");
    }
}