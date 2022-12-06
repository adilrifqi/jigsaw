import { Expr } from "../expr/Expr";
import { Location } from "../location/Location";
import { Command } from "./Command";

export class WhileCommand extends Command {
    private readonly condition: Expr;
    private readonly command: Command;

    constructor(condition: Expr, command: Command, location: Location) {
        super(location);
        this.condition = condition;
        this.command = command;
    }

    public execute(): boolean {
        this.condition.reset();
        while(this.condition.value() as boolean)
            if (!this.command.execute()!)
                return false;
        return true;
    }
}