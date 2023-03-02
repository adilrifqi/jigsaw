import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Command } from "./Command";

export class ScopeCommand extends Command {
    private readonly commands: Command[];
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(commands: Command[], runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.commands = commands;
        this.runtime = runtime;
        this.ctx = ctx;
    }
    
    public execute(): RuntimeError | undefined {
        if (!this.runtime.openVariableScope())
            return new RuntimeError(this.ctx, "For some reason, a new variable scope cannot be opened.");

        for (var command of this.commands) {
            const executionResult: RuntimeError | undefined = command.execute();
            if (executionResult) return executionResult;
        }

        if (!this.runtime.closeVariableScope())
            return new RuntimeError(this.ctx, "For some reason, variable scope cannot be closed.");

        return undefined;
    }
}