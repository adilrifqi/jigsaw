import { Command } from "../command/Command";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Expr } from "./Expr";

export class ReassignCommand extends Command {
    private readonly varName: string;
    private readonly expr: Expr;
    private readonly runtime: CustomizationRuntime;

    constructor(varName: string, expr: Expr, runtime: CustomizationRuntime) {
        super();
        this.varName = varName;
        this.expr = expr;
        this.runtime = runtime;
    }

    public execute(): boolean {
        this.expr.initialize();
        return this.runtime.reassignVariable(this.varName, this.expr.type(), this.expr.value());
    }
}