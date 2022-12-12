import { RuntimeError } from "../../error/RuntimeError";
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

    public execute(): RuntimeError | undefined {
        this.condition.reset();

        var conditionValue: Object = this.condition.value() as Object;
        if (conditionValue instanceof RuntimeError) return conditionValue;
        var conditionPassed: boolean = conditionValue as boolean;

        while(conditionPassed) {
            const commandResult: RuntimeError | undefined = this.command.execute();
            if (commandResult) return commandResult;

            conditionValue = this.condition.value() as Object;
            if (conditionValue instanceof RuntimeError) return conditionValue;
            conditionPassed = conditionValue as boolean;
        }
        return undefined;
    }
}