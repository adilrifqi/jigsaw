import { JigsawVariable } from "../../../../debugmodel/JigsawVariable";
import { RuntimeError } from "../../error/RuntimeError";
import { Command } from "../command/Command";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { CustSpecComponent } from "../CustSpecComponent";

export abstract class Location extends CustSpecComponent {
    
    private readonly name: string;
    private readonly runtime: CustomizationRuntime;
    
    private parent?: Location;
    private commands: Command[] = [];
    private children: Location[] = [];

    private permanent: boolean = false;

    constructor(name: string, runtime: CustomizationRuntime, parent?: Location, children?: Location[], commands?: Command[]) {
        super();
        this.name = name;
        this.runtime = runtime;
        this.setParent(parent);
        this.children = children ? children : this.children;
        this.commands = commands ? commands : this.commands;
    }

    public abstract type(): LocationType;

    public getName(): string {
        return this.name;
    }

    public getParent(): Location | undefined {
        return this.parent;
    }

    public setParent(newParent: Location | undefined): boolean {
        // if (this.parent && newParent) return false;
        this.parent?.removeChild(this);
        this.parent = newParent;
        this.parent?.addChild(this);
        return true;
    }

    public getChildren(): Location[] {
        return this.children;
    }

    public setChildren(newChildren: Location[]) {
        this.children = newChildren;
        for (const child of this.children)
            child.setParent(this);
    }

    public addChild(newChild: Location): boolean {
        for (var child of this.children)
            if (child.getName() === newChild.getName()) return false;
        this.children.push(newChild);
        return true;
    }

    public removeChild(child: Location): boolean {
        var toRemove: number = -1;
        for (var i = 0; i < this.children.length; i++)
            if (this.children[i] === child) {
                toRemove = i;
                break;
            }
        if (toRemove > -1) {
            this.children.splice(toRemove, 1);
            return true;
        }
        return false;
    }

    public getChild(name: string, type: LocationType): Location | undefined {
        for (const child of this.children)
            if (name === child.getName() && type == child.type())
                return child;
        return undefined;
    }

    public getCommands(): Command[] {
        return this.commands;
    }

    public setCommands(commands: Command[]) {
        this.commands = commands;
        for (const command of this.commands)
            command.setLocation(this);
    }

    public addCommand(command: Command) {
        this.commands.push(command);
    }

    public setPermanence(perm: boolean) {
        this.permanent = perm;
    }

    public isPermanent(): boolean {
        return this.permanent;
    }

    public execute(variable: JigsawVariable): RuntimeError | undefined {
        // TODO: Do something with the variable
        this.runtime.openLocationScope();

        for (var command of this.commands) {
            const commandResult: RuntimeError | undefined = command.execute();
            if (commandResult) return commandResult;
        }

        this.runtime.closeLocationScope();
        return undefined;
    }
}

export enum LocationType {
    CLASS, FIELD, METHOD
}