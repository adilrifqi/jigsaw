export class JigsawVariable {
    name: string;
    value: string;
    type: string;
    variablesReference: number;
    namedVariables: number;
    indexedVariables: number;
    evaluateName: string;
    variables: Set<string>;

    constructor(
        name: string,
        value: string,
        type: string,
        variablesReference: number,
        namedVariables: number,
        indexedVariables: number,
        evaluateName: string,
        variables: Set<string> = new Set() // Set of keys of DebugState.getInstance().jigsawVariables
        ) {
            this.name = name;
            this.value = value;
            this.type = type;
            this.variablesReference = variablesReference;
            this.namedVariables = namedVariables;
            this.indexedVariables = indexedVariables;
            this.evaluateName = evaluateName;
            this.variables = variables;
    }

    public addVariable(varKey: string) {
        this.variables.add(varKey);
    }

    public deleteVariable(varKey: string) {
        this.variables.delete(varKey);
    }

    public getVariablesKeys(): Set<string> {
        return this.variables;
    }
}