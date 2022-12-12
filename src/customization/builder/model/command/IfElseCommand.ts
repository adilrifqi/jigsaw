import { RuntimeError } from "../../error/RuntimeError";
import { Expr } from "../expr/Expr";
import { Location } from "../location/Location";
import { Command } from "./Command";

export class IfElseCommand extends Command {
    private readonly conditions: Expr[];
    private readonly commands: Command[];

    constructor(conditions: Expr[], commands: Command[], location: Location) {
        super(location);
        this.conditions = conditions;
        this.commands = commands;
    }

    public execute(): RuntimeError | undefined {
        for (var i = 0; i < this.conditions.length; i++) {
            const conditionExpr: Expr = this.conditions[i];
            const conditionValue: Object = conditionExpr.eval() as Object;
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