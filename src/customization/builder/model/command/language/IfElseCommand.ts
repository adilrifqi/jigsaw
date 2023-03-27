import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../../error/RuntimeError";
import { Expr } from "../../expr/Expr";
import { Command } from "./Command";

export class IfElseCommand extends Command {
    private readonly conditions: Expr[];
    private readonly commands: Command[];
    private readonly ctx: ParserRuleContext;

    constructor(conditions: Expr[], commands: Command[], ctx: ParserRuleContext) {
        super();
        this.conditions = conditions;
        this.commands = commands;
        this.ctx = ctx;
    }

    public execute(): RuntimeError | undefined {
        for (var i = 0; i < this.conditions.length; i++) {
            const conditionExpr: Expr = this.conditions[i];
            const conditionValue: Object | null = conditionExpr.eval();
            if (conditionValue === null) return new RuntimeError(this.ctx, "null as condition.");
            if (conditionValue instanceof RuntimeError) return conditionValue;

            const condition: boolean = conditionValue as boolean;
            if (condition) return this.commands[i].execute();
        }

        // This means there is an "else" statement
        if (this.commands.length > this.conditions.length)
            return this.commands[this.commands.length - 1].execute();

        return undefined;
    }
}