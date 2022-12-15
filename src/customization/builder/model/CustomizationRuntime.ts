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

export type Subject = {
	id: string
}

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
			location.execute(variable); // TODO: Do something in case of RuntimeError
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

	public getSubjectNode(subject: Subject): NodeInfo | null {
		var result: NodeInfo | null = null;
		for (const node of this.nodes)
			if (node.id === subject.id) {
				result = node;
				break;
			}
		return result;
	}

	public getCurrentSubject(): Subject {
		return {id: this.currentVariable.id};
	}

	public getParentsOf(subject: Subject): Subject[] {
		const result: Subject[] = [];
		const frame: StackFrame | undefined = DebugState.getInstance().getFrameByPos(this.stackPos);
		if (frame)
			for (const [varKey, variable] of frame.jigsawVariables)
				for (const [_, fieldKey] of variable.variables)
					if (fieldKey === subject.id) result.push({id: varKey});
		return result;
    }

	public getFieldOfName(subject: Subject, fieldName: string): Subject | null {
		const frame: StackFrame | undefined = DebugState.getInstance().getFrameByPos(this.stackPos);
		if (frame) {
			const variable: JigsawVariable = frame.jigsawVariables.get(subject.id)!;
			for (const [varFieldName, varFieldKey] of variable.variables)
				if (varFieldName === fieldName)
					return {id: varFieldKey};
		}
		return null
	}

	public getChildrenOf(subject: Subject): Subject[] {
		const result: Subject[] = [];
		const frame: StackFrame | undefined = DebugState.getInstance().getFrameByPos(this.stackPos);
		if (frame) {
			const variable: JigsawVariable = frame.jigsawVariables.get(subject.id)!;
			for (const [_, fieldKey] of variable.variables)
				result.push({id: fieldKey});
		}
		return result;
	}

	public getCurrentVariableField(fieldName: string): Subject | null {
		for (const [varFieldName, fieldVarKey] of this.currentVariable.variables)
			if (varFieldName === fieldName)
				return {id: fieldVarKey};
		return null;
	}

	public getSubjectValue(subject: Subject): Object | null {
		const frame: StackFrame | undefined = DebugState.getInstance().getFrameByPos(this.stackPos);
		if (frame) {
			for (const [varId, variable] of frame.jigsawVariables)
				if (varId === subject.id) {
					if (variable.type === "int") return +variable.value;
					else if (variable.type === "String")  {
						const stringValue: string = variable.value as string;
						return stringValue.substring(1, stringValue.length - 1);
					}
					else if (variable.type === "boolean") return variable.value === "true";
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

	public addNodes(newNodes: NodeInfo[]): boolean {
		var allSuccess: boolean = true;
		for (const newNode of newNodes)
			allSuccess = allSuccess && this.addNode(newNode);
		return allSuccess;
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

	public addEdges(newEdges: EdgeInfo[]): boolean {
		var allSuccess: boolean = true;
		for (const newEdge of newEdges)
			allSuccess = allSuccess && this.addEdge(newEdge);
		return allSuccess;
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

	public omitNodes(nodes: NodeInfo[]): boolean {
		var allSuccess: boolean = true;
		for (const node of nodes)
			allSuccess = allSuccess && this.omitNode(node);
		return allSuccess;
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

	public omitEdges(edges: EdgeInfo[]): boolean {
		var allSucces: boolean = true;
		for (const edge of edges)
			allSucces = allSucces && this.omitEdge(edge);
		return allSucces;
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

	public getEdges(origin: NodeInfo, target: NodeInfo): EdgeInfo[] {
		const result: EdgeInfo[] = [];
		for (const edge of this.edges)
			if (edge.source === origin.id && edge.target === target.id)
				result.push(edge);
		return result;
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