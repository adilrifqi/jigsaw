import { JigsawVariable } from "../../../../debugmodel/JigsawVariable";
import { RuntimeError } from "../../error/RuntimeError";
import { Command } from "../command/Command";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Statement } from "../Statement";

export abstract class Location extends Statement {
    
    private readonly name: string;
    private readonly runtime: CustomizationRuntime;
    
    protected parent?: Location;
    private statements: Statement[] = [];

    private permanent: boolean = false;

    constructor(name: string, runtime: CustomizationRuntime, parent?: Location, statements?: Statement[]) {
        super(parent);
        this.name = name;
        this.runtime = runtime;
        this.setParent(parent);
        this.statements = statements ? statements : this.statements;
    }

    public abstract type(): LocationType;

    public getName(): string {
        return this.name;
    }

    public getParent(): Location | undefined {
        return this.parent;
    }

    public getChildrenLocations(): Location[] {
        const result: Location[] = [];
        for (const statement of this.statements)
            if (statement instanceof Location)
                result.push(statement);
        return result;
    }

    public setStatements(newStatements: Statement[]) {
        this.statements = newStatements;
        for (const statement of this.statements)
            statement.setParent(this);
    }

    public addStatement(newStatement: Statement) {
        if (newStatement instanceof Location)
            for (const child of this.getChildrenLocations())
                if (child.getName() === newStatement.getName() && child.type() == newStatement.type())
                    return false;
        if (!this.statements.includes(newStatement)) {
            this.statements.push(newStatement);
            newStatement.setParent(this);
            return true;
        }
        return false;
    }

    public getStatements(): Statement[] {
        return this.statements;
    }

    public getChild(name: string, type: LocationType): Location | undefined {
        for (const child of this.getChildrenLocations())
            if (name === child.getName() && type == child.type())
                return child;
        return undefined;
    }

    public setPermanence(perm: boolean) {
        this.permanent = perm;
    }

    public isPermanent(): boolean {
        return this.permanent;
    }

    // public execute(variable?: JigsawVariable): RuntimeError | undefined {
    //     // TODO: Do something with the variable
    //     this.runtime.openLocationScope();

    //     for (var command of this.commands) {
    //         const commandResult: RuntimeError | undefined = command.execute();
    //         if (commandResult) return commandResult;
    //     }

    //     this.runtime.closeLocationScope();
    //     return undefined;
    // }
}

export enum LocationType {
    CLASS, FIELD, METHOD, LOCAL
}