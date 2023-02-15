import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Expr } from "../expr/Expr";
import { Location } from "../location/Location";
import { Command } from "./Command";

export class ConditionForLoopCommand extends Command {
    private readonly forInit?: Command;
    private readonly condition: Expr;
    private readonly forUpdate?: Command;
    private readonly command: Command;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext

    constructor(forInit: Command | undefined, condition: Expr, forUpdate: Command | undefined, command: Command, runtime: CustomizationRuntime, ctx: ParserRuleContext, location?: Location) {
        super(location);
        this.forInit = forInit;
        this.condition = condition;
        this.forUpdate = forUpdate;
        this.command = command;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public execute(): RuntimeError | undefined {
        if (!this.runtime.openVariableScope())
            return new RuntimeError(this.ctx, "For some reason, a new variable scope cannot be opened.");

        const initResult: RuntimeError | undefined = this.forInit ? this.forInit.execute() : undefined;
        if (initResult) return initResult;

        var conditionValue: Object | null = this.condition.eval() as Object;
        if (conditionValue === null) return new RuntimeError(this.ctx, "null as condition.");
        if (conditionValue instanceof RuntimeError) return conditionValue;
        var conditionPassed: boolean = conditionValue as boolean;

        while (conditionPassed) {
            if (!this.runtime.openVariableScope())
                return new RuntimeError(this.ctx, "For some reason, a new variable scope cannot be opened.");

            const commandResult: RuntimeError | undefined = this.command.execute();
            if (commandResult) return commandResult;

            if (!this.runtime.closeVariableScope())
                return new RuntimeError(this.ctx, "For some reason, variable scope cannot be closed.");

            const updateResult: RuntimeError | undefined = this.forUpdate ? this.forUpdate.execute() : undefined;
            if (updateResult) return updateResult;
            conditionValue = this.condition.eval() as Object;
            if (conditionValue instanceof RuntimeError) return conditionValue;
            conditionPassed = conditionValue as boolean;
        }

        if (!this.runtime.closeVariableScope())
            return new RuntimeError(this.ctx, "For some reason, variable scope cannot be closed.");

        return undefined;
    }
}