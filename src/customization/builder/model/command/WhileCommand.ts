import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Expr } from "../expr/Expr";
import { Command } from "./Command";

export class WhileCommand extends Command {
    private readonly condition: Expr;
    private readonly command: Command;
    private readonly ctx: ParserRuleContext;
    private readonly runtime: CustomizationRuntime;

    constructor(condition: Expr, command: Command, ctx: ParserRuleContext, runtime: CustomizationRuntime) {
        super();
        this.condition = condition;
        this.command = command;
        this.ctx = ctx;
        this.runtime = runtime;
    }

    public execute(): RuntimeError | undefined {
        var conditionValue: Object | null = this.condition.eval() as Object;
        if (conditionValue === null) return new RuntimeError(this.ctx, "null as condition.");
        if (conditionValue instanceof RuntimeError) return conditionValue;
        var conditionPassed: boolean = conditionValue as boolean;

        while(conditionPassed) {
            if (!this.runtime.openVariableScope())
                return new RuntimeError(this.ctx, "For some reason, a new variable scope cannot be opened.");

            const commandResult: RuntimeError | undefined = this.command.execute();
            if (commandResult) return commandResult;

            if (!this.runtime.closeVariableScope())
                return new RuntimeError(this.ctx, "For some reason, variable scope cannot be closed.");

            conditionValue = this.condition.eval() as Object;
            if (conditionValue instanceof RuntimeError) return conditionValue;
            conditionPassed = conditionValue as boolean;
        }
        return undefined;
    }
}