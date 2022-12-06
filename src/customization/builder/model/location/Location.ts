import { JigsawVariable } from "../../../../debugmodel/JigsawVariable";
import { Command } from "../command/Command";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { CustSpecComponent } from "../CustSpecComponent";
import { LocationType } from "./LocationType";

export class Location extends CustSpecComponent {
    
    private readonly name: string;
    private readonly type: LocationType;
    private readonly runtime: CustomizationRuntime;
    
    private parent?: Location;
    private commands: Command[] = [];
    private children: Location[] = [];

    constructor(name: string, type: LocationType, runtime: CustomizationRuntime);
    constructor(name: string, type: LocationType, runtime: CustomizationRuntime, parent?: Location);
    constructor(name: string, type: LocationType, runtime: CustomizationRuntime, parent?: Location, children?: Location[]);
    constructor(name: string, type: LocationType, runtime: CustomizationRuntime, parent?: Location, children?: Location[], commands?: Command[]) {
        super();
        this.name = name;
        this.type = type;
        this.runtime = runtime;
        this.parent = parent;
        this.children = children ? children : this.children;
        this.commands = commands ? commands : this.commands;
    }

    public getName(): string {
        return this.name;
    }

    public getType(): LocationType {
        return this.type;
    }

    public getParent(): Location | undefined {
        return this.parent;
    }

    public setParent(newParent: Location | undefined): boolean {
        if (this.parent && newParent) return false;
        this.parent?.removeChild(this);
        this.parent = newParent;
        this.parent?.addChild(this);
        return true;
    }

    public getPathString(): string {
        var result: string = this.name;

        var nextParent: Location | undefined = this.parent;
        while (nextParent) {
            result = nextParent.getName() + "." + result;
            nextParent = nextParent.getParent();
        }

        return result;
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

    public getChild(name: string): Location | undefined {
        for (var child of this.children)
            if (child.getName() === this.name) return child;
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

    public execute(variable: JigsawVariable): boolean {
        // TODO: Do something with the variable
        this.runtime.openLocationScope();
        for (var command of this.commands)
            if (!command.execute())
                return false;
        return this.runtime.closeLocationScope();
    }

    public getPath(): {name: string, type: LocationType}[] {
        const result: {name: string, type: LocationType}[] = [];
        var current: Location | undefined = this;
        while (current) {
            result.unshift({name: current.getName(), type: current.getType()});
            current = current.getParent();
        }
        return result;
    }
}