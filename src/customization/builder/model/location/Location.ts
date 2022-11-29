import { Command } from "../command/Command";
import { CustSpecComponent } from "../CustSpecComponent";

export class Location extends CustSpecComponent {
    private readonly name: string;
    private parent?: Location;

    private commands: Command[] = [];
    private children: Location[] = [];

    constructor(name: string);
    constructor(name: string, parent?: Location);
    constructor(name: string, parent?: Location, children?: Location[]);
    constructor(name: string, parent?: Location, children?: Location[], commands?: Command[]) {
        super();
        this.name = name;
        this.parent = parent;
        this.children = children ? children : this.children;
        this.commands = commands ? commands : this.commands;
    }

    public getName(): string {
        return this.name;
    }

    public getParent(): Location | undefined {
        return this.parent;
    }

    public setParent(newParent: Location | undefined): boolean {
        if (this.parent && newParent) return false;
        this.parent = this.parent;
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
    }

    public addChild(newChild: Location): boolean {
        for (var child of this.children)
            if (child.getName() === newChild.getName()) return false;
        this.children.push(newChild);
        return true;
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
    }

    public addCommand(command: Command) {
        this.commands.push(command);
    }
}