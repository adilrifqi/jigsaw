import { ValueType } from "./expr/ValueType";
import { Location } from "./location/Location";
import { RTLocationScope, Variable } from "./RTLocationScope";

export class CustomizationRuntime {
    private topLocations: Location[] = [];
    private graph: any = {};
    private runtimeScopes: RTLocationScope[] = [];

	public getTopLocations(): Location[]  {
		return this.topLocations;
	}

	public getGraph(): any  {
		return this.graph;
	}

	public setTopLocations(value: Location[] ) {
		this.topLocations = value;
	}

	public setGraph(value: any) {
		this.graph = value;
	}

    public applyCustomization() {
        for (var location of this.topLocations) location.execute();
    }

	// ====================Scope Methods====================
	public addVarible(name: string, type: ValueType, value: any): boolean {
		if (this.runtimeScopes.length == 0) return false;
		return this.runtimeScopes.at(-1)!.addVarible(name, type, value);
    }

    public updateVariable(name: string, type: ValueType, value: any): boolean {
        if (this.runtimeScopes.length == 0) return false;
		return this.runtimeScopes.at(-1)!.updateVariable(name, type, value);
    }

    public getVariable(name: string): Variable | undefined {
		if (this.runtimeScopes.length == 0) return undefined;
		return this.runtimeScopes.at(-1)?.getVariable(name);
    }

    public containsVariable(name: string): boolean {
        return this.getVariable(name) != undefined && this.getVariable(name) != null;
    }

	public openVariableScope(): boolean {
		if (this.runtimeScopes.length == 0) return false;
		this.runtimeScopes.at(-1)!.openVariableScope();
		return true;
	}

	public closeVariableScope(): boolean {
		if (this.runtimeScopes.length == 0) return false;
		return this.runtimeScopes.at(-1)!.closeVariableScope();
	}

	public openLocationScope() {
		this.runtimeScopes.push(new RTLocationScope());
	}

	public closeLocationScope(): boolean {
        if (this.runtimeScopes.length == 0) return false;
        this.runtimeScopes.pop();
        return true;
    }
}