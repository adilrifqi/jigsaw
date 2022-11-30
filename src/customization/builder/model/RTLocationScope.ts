import { ValueType } from "./expr/ValueType";

export class RTLocationScope {
    private readonly vars: Map<string, Variable>[] = [];

    public addVarible(name: string, type: ValueType | null, value: any): boolean {
        if (this.vars.length == 0 || this.containsVariable(name)) return false;
        this.vars.at(-1)!.set(name, new Variable(name, type, value));
        return true;
    }

    public updateVariable(name: string, type: ValueType | null, value: any): boolean {
        for (var i = this.vars.length - 1; i >= 0; i--) {
            const scope: Map<string, Variable> = this.vars[i];
            if (scope.has(name)) {
                scope.set(name, new Variable(name, type, value));
                return true;
            }
        }
        return false;
    }

    public getVariable(name: string): Variable | undefined {
        for (var i = this.vars.length - 1; i >= 0; i--) {
            if (this.vars[i].has(name)) return this.vars[i].get(name);
        }
        return undefined;
    }

    public containsVariable(name: string): boolean {
        return this.getVariable(name) != undefined && this.getVariable(name) != null;
    }

    public openVariableScope() {
        this.vars.push(new Map());
    }

    public closeVariableScope(): boolean {
        if (this.vars.length == 0) return false;
        this.vars.pop();
        return true;
    }
}

export class Variable {
    public readonly name: string;
    public readonly type: ValueType | null;
    public readonly value: any;

    constructor(name: string, type: ValueType | null, value: any) {
        this.name = name;
        this.type = type;
        this.value = value;
    }
}