import { DebugState } from "../../../debugmodel/DebugState";
import { EdgeInfo, NodeInfo, VariableInfo } from "../../../debugmodel/DiagramInfo";
import { JigsawVariable } from "../../../debugmodel/JigsawVariable";
import { StackFrame } from "../../../debugmodel/StackFrame";
import { CustSpecComponent } from "./CustSpecComponent";
import { ArrayType } from "./expr/ArrayExpr";
import { ValueType } from "./expr/ValueType";
import { Location } from "./location/Location";
import { LocationType } from "./location/LocationType";
import { RTLocationScope, Variable } from "./RTLocationScope";

export class CustomizationRuntime extends CustSpecComponent {
    private topLocations: Location[] = [];
    private runtimeScopes: RTLocationScope[] = [];

	private nodes: NodeInfo[] = [];
	private edges: EdgeInfo[] = [];
	private stackPos: number = 0;

	private currentLocation!: Location;
	private currentVariable!: JigsawVariable;

	public getTopLocations(): Location[]  {
		return this.topLocations;
	}

	public setTopLocations(value: Location[] ) {
		this.topLocations = value;
	}

	public applyCustomization(nodes: NodeInfo[] = [], edges: EdgeInfo[] = [], stackPos: number = 0): {nodes: NodeInfo[], edges: EdgeInfo[]} {
		this.nodes = nodes;
		this.edges = edges;
		this.stackPos = stackPos;

		const frame: StackFrame | undefined = DebugState.getInstance().getFrameByPos(stackPos);
		if (frame)
			for (const [varKey, variable] of frame.jigsawVariables)
				for (const topLocation of this.topLocations)
					if (this.customizationDispatch(variable, {class: variable.type}, topLocation, frame))
						break;

		return {nodes: this.nodes, edges: this.edges};
    }

	private customizationDispatch(variable: JigsawVariable, interestNames: {class?: string, field?: string}, location: Location, frame: StackFrame): boolean {
		switch (location.getType()) {
			case LocationType.CLASS:
				if (interestNames.class !== undefined && interestNames.class !== null)
					return this.customizeLocation(variable, interestNames.class, location, frame);
				break;
			case LocationType.FIELD:
				if (interestNames.field !== undefined && interestNames.field !== null)
					return this.customizeLocation(variable, interestNames.field, location, frame);
				break;
		}
		return false;
	}

	private customizeLocation(variable: JigsawVariable, interestName: string, location: Location, frame: StackFrame): boolean {
		if (interestName === location.getName()) {
			this.currentLocation = location;
			this.currentVariable = variable;
			location.execute(variable);
			for (const [fieldName, varsVarKey] of variable.variables) {
				const varsVarVariable: JigsawVariable = frame.jigsawVariables.get(varsVarKey)!;
				for (var child of location.getChildren())
					if (this.customizationDispatch(varsVarVariable, {class: varsVarVariable.type, field: fieldName}, child, frame))
						break;
			}
			return true;
		}
		return false;
	}

	public getCurrentVariableNode(): NodeInfo | null {
		const frame: StackFrame | undefined = DebugState.getInstance().getFrameByPos(this.stackPos);
		if (frame) {
			switch(this.currentLocation.getType()) {
			case LocationType.CLASS:
				for (const node of this.nodes)
					if (node.id === this.currentVariable.value)
						return node;
				return null;
			case LocationType.FIELD:
				const path: {name: string, type: LocationType}[] = this.currentLocation.getPath();
				var possibles: {variable: JigsawVariable, node: NodeInfo | null}[] = [];
				
				for (const loc of path) {
					const result: {variable: JigsawVariable, node: NodeInfo | null}[] = [];
					switch(loc.type) {
						case LocationType.CLASS:
							for (const node of this.nodes)
								if (typeof node.data.title !== 'string' && node.data.title.type === loc.name)
									result.push({variable: frame.jigsawVariables.get(node.id)!, node: node});
							break;
						case LocationType.FIELD:
							for (const possible of possibles)
								for (const [fieldName, varKey] of possible.variable.variables)
									if (fieldName === loc.name) {
										var nextNode: NodeInfo | null = null;
										for (const node of this.nodes)
											if (node.id === varKey) {
												nextNode = node;
												break;
											}
										result.push({variable: frame.jigsawVariables.get(varKey)!, node: nextNode});
										break;
									}
							break;
					}
					possibles = result;
				}
				for (const possible of possibles)
					if (possible.variable === this.currentVariable)
						return possible.node;
				return null;
			}
		}
		return null;
	}

	// ====================Customization Methods====================
	public addNode(newNode: NodeInfo): boolean {
		for (const node of this.nodes)
			if (node.id === newNode.id)
				return false;
		this.nodes.push(newNode);
		return true;
	}

	public addEdge(newEdge: EdgeInfo): boolean {
		var sourceFound: boolean = false;
		var targetFound: boolean = false;
		for (const node of this.nodes) {
			sourceFound = sourceFound || newEdge.source === node.id;
			targetFound = targetFound || newEdge.source === node.id;
			if (sourceFound && targetFound) break;
		}
		if (!sourceFound || !targetFound) return false;
		this.edges.push(newEdge);
		return true;
    }

	public omitNode(node: NodeInfo): boolean {
		var remNodeIndex: number = -1;
		for (var i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].id === node.id) {
				remNodeIndex = i;
				break;
			}
		}
		if (remNodeIndex > -1) {
			const remNodeId: string = this.nodes[remNodeIndex].id;
			const remEdgeIndices: number[] = [];
			for (var i = 0; i < this.edges.length; i++) {
				const edge: EdgeInfo = this.edges[i];
				if (edge.source === remNodeId || edge.target === remNodeId)
					remEdgeIndices.push(i);
			}
			for (var remEdgeIndex of remEdgeIndices) this.edges.splice(remEdgeIndex, 1);

			this.nodes.splice(remNodeIndex, 1);
			return true;
		} else return false;
	}

	public omitEdge(toOmit: EdgeInfo): boolean {
		var toOmitIndex: number = -1;
		for (var i = 0; i < this.edges.length; i++)
			if (toOmit.id === this.edges[i].id) {
				toOmitIndex = i;
				break;
			}
		
		if (toOmitIndex > -1) {
			this.edges.splice(toOmitIndex, 1);
			return true;
		} else return false;
	}

	public getNodesOfType(typeName: string): NodeInfo[] {
		const result: NodeInfo[] = [];
		for (var node of this.nodes) {
			const titleInfo: VariableInfo | string = node.data.title;
			if (typeof titleInfo !== 'string')
				if (titleInfo.type === typeName)
					result.push(node);
		}
		return result;
	}

	public getFieldNodesOfNodes(originNodes: NodeInfo[], fieldName: string): NodeInfo[] {
		const result: NodeInfo[] = [];
		const frame: StackFrame | undefined = DebugState.getInstance().getFrameByPos(this.stackPos);
		if (!frame) throw new Error("getFieldNodesOfNodes: invalid stackPos");
		for (var originNode of originNodes) {
			const variable: JigsawVariable | undefined = frame.jigsawVariables.get(originNode.id);
			if (!variable) continue;
			const fieldKey: string | undefined = variable.variables.get(fieldName);
			if (fieldKey === undefined || fieldKey === null) continue;
			const correspondingNode: NodeInfo | undefined = this.getNode(fieldKey);
			if (correspondingNode) result.push(correspondingNode);
		}
		return result;
	}

	private getNode(id: string): NodeInfo | undefined {
		for (var node of this.nodes)
			if (node.id === id)
				return node;
		return undefined;
	}

	// ====================Scope Methods====================
	public addVarible(name: string, type: ValueType | ArrayType, value: any): boolean {
		if (this.runtimeScopes.length == 0) return false;
		return this.runtimeScopes.at(-1)!.addVarible(name, type, value);
    }

    public reassignVariable(name: string, type: ValueType | ArrayType, value: any): boolean {
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