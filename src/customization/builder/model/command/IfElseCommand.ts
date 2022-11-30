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

    public execute(): boolean {
        for (var i = 0; i < this.conditions.length; i++)
            if (this.conditions[i].value())
                return this.commands[i].execute();

        // This means there is an "else" statement
        if (this.commands.length > this.conditions.length)
            return this.commands[this.commands.length - 1].execute();

        return true;
    }
}