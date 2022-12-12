import { Command } from "./Command";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Location } from "../location/Location";
import { Expr } from "../expr/Expr";
import { RuntimeError } from "../../error/RuntimeError";
import { ParserRuleContext } from "antlr4ts";

export class ReassignCommand extends Command {
    private readonly varName: string;
    private readonly expr: Expr;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(varName: string, expr: Expr, runtime: CustomizationRuntime, location: Location, ctx: ParserRuleContext) {
        super(location);
        this.varName = varName;
        this.expr = expr;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public execute(): RuntimeError | undefined {
        this.expr.reset();
        const exprValue: Object | null = this.expr.value();
        if (exprValue instanceof RuntimeError) return exprValue;

        if (!this.runtime.reassignVariable(this.varName, this.expr.type(), exprValue))
            return new RuntimeError(this.ctx, "For some reason, reassigning to non-existant variable in runtime.");
        return undefined;
    }
}