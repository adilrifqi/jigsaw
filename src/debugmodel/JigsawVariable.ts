export class JigsawVariable {
    id!: string;
    name: string;
    value: string;
    type: string;
    variablesReference: number;
    namedVariables: number;
    indexedVariables: number;
    evaluateName: string;
    variables: Map<string, string>;
    parents: Map<string, string>;
    lazy: boolean;
    stringRep: string | undefined

    constructor(
        name: string,
        value: string,
        type: string,
        variablesReference: number,
        namedVariables: number,
        indexedVariables: number,
        evaluateName: string,
        lazy: boolean = false,

        // Keys of DebugState.getInstance().jigsawVariables to name of field of reffed variable in the object
        variables: Map<string, string> = new Map(),
        ) {
            this.name = name;
            this.value = value;
            this.type = type;
            this.variablesReference = variablesReference;
            this.namedVariables = namedVariables;
            this.indexedVariables = indexedVariables;
            this.evaluateName = evaluateName;
            this.variables = variables;
            this.parents = new Map()
            this.lazy = lazy;
    }

    public setVariable(fieldName: string, varKey: string) {
        this.variables.set(fieldName, varKey);
    }

    public addParent(fieldNameInParent: string, parentKey: string) {
        this.parents.set(fieldNameInParent, parentKey);
    }

    public getFields(): Map<string, string> {
        return this.variables;
    }
}