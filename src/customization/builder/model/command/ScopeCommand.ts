import { CustomizationRuntime } from "../CustomizationRuntime";
import { Command } from "./Command";

export class ScopeCommand extends Command {
    private readonly commands: Command[];
    private readonly runtime: CustomizationRuntime;

    constructor(commands: Command[], runtime: CustomizationRuntime) {
        super();
        this.commands = commands;
        this.runtime = runtime;
    }
    
    public execute(): boolean {
        if (!this.runtime.openVariableScope()) return false;
        for (var command of this.commands) if (!command.execute()) return false;
        return this.runtime.closeVariableScope();
    }
}