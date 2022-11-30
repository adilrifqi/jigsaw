import { Expr } from "../expr/Expr";
import { Command } from "./Command";

export class WhileCommand extends Command {
    private readonly condition: Expr;
    private readonly command: Command;

    constructor(condition: Expr, command: Command) {
        super();
        this.condition = condition;
        this.command = command;
    }

    public execute(): boolean {
        while(this.condition.value() as boolean)
            if (!this.command.execute()!)
                return false;
        return true;
    }
}