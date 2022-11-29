import { Command } from "./Command";

export class ScopeCommand extends Command {
    private readonly commands: Command[];

    constructor(commands: Command[]) {
        super();
        this.commands = commands;
    }
    
    public execute(): void {
        for (var command of this.commands) command.execute();
    }
}