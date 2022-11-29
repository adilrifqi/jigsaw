import { BooleanExpr } from "../expr/BooleanExpr";
import { Command } from "./Command";

export class IfElseCommand extends Command {
    private readonly conditions: BooleanExpr[];
    private readonly commands: Command[];

    constructor(conditions: BooleanExpr[], commands: Command[]) {
        super();
        this.conditions = conditions;
        this.commands = commands;
    }

    public execute(): void {
        for (var i = 0; i < this.conditions.length; i++) {
            if (this.conditions[i].value()) {
                this.commands[i].execute();
                return;
            }
        }

        // This means there is an "else" statement
        if (this.commands.length > this.conditions.length)
            this.commands[this.commands.length - 1].execute();
    }
}