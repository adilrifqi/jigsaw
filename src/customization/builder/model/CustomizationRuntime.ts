import { CustSpecComponent } from "./CustSpecComponent";
import { ValueType } from "./expr/ValueType";
import { Location } from "./location/Location";
import { Node } from "./Node";
import { RTLocationScope, Variable } from "./RTLocationScope";

export class CustomizationRuntime extends CustSpecComponent {
    private topLocations: Location[] = [];
    private runtimeScopes: RTLocationScope[] = [];

	private nodes: any[] = [];
	private edges: any[] = [];

	public getTopLocations(): Location[]  {
		return this.topLocations;
	}

	public setTopLocations(value: Location[] ) {
		this.topLocations = value;
	}

    public applyCustomization(nodes?: any[], edges?: any[]): {nodes: any[], edges: any[]} {
		if (nodes !== undefined && nodes !== null) this.nodes = nodes!;
		if (edges !== undefined && edges !== null) this.edges = edges!;
        for (var location of this.topLocations) location.execute();
		return {nodes: this.nodes, edges: this.edges};
    }

	// ====================Customization Methods====================
	public addNode(node: Node) {
		this.nodes.push( {
			id: node.getName(),
			data: {
				layedOut: false,
				variable: node,
				scopeTopVar: true // Doesn't really matter
			},
			position: { x: 0, y: 0 },
			type: 'object'
		});
	}

	// ====================Scope Methods====================
	public addVarible(name: string, type: ValueType | null, value: any): boolean {
		if (this.runtimeScopes.length == 0) return false;
		return this.runtimeScopes.at(-1)!.addVarible(name, type, value);
    }

    public reassignVariable(name: string, type: ValueType | null, value: any): boolean {
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