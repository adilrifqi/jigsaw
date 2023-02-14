import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { Expr } from "../expr/Expr";
import { Location } from "../location/Location";
import { Command } from "./Command";

export class WhileCommand extends Command {
    private readonly condition: Expr;
    private readonly command: Command;
    private readonly ctx: ParserRuleContext;

    constructor(condition: Expr, command: Command, ctx: ParserRuleContext, location?: Location) {
        super(location);
        this.condition = condition;
        this.command = command;
        this.ctx = ctx;
    }

    public execute(): RuntimeError | undefined {
        var conditionValue: Object | null = this.condition.eval() as Object;
        if (conditionValue === null) return new RuntimeError(this.ctx, "null as condition.");
        if (conditionValue instanceof RuntimeError) return conditionValue;
        var conditionPassed: boolean = conditionValue as boolean;

        while(conditionPassed) {
            const commandResult: RuntimeError | undefined = this.command.execute();
            if (commandResult) return commandResult;

            conditionValue = this.condition.eval() as Object;
            if (conditionValue instanceof RuntimeError) return conditionValue;
            conditionPassed = conditionValue as boolean;
        }
        return undefined;
    }
}