import { BooleanExpr } from "../expr/BooleanExpr";
import { Command } from "./Command";

export class WhileCommand extends Command {
    private readonly condition: BooleanExpr;
    private readonly command: Command;

    constructor(condition: BooleanExpr, command: Command) {
        super();
        this.condition = condition;
        this.command = command;
    }

    public execute(): void {
        while(this.condition.value()) this.command.execute();
    }
}