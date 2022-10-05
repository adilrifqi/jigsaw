import { JigsawVariable } from "./JigsawVariable";

export class DebugState {
    // #region singleton
    private static _instance: DebugState;
    public static getInstance(): DebugState {
        if (this._instance == null) {
            this._instance = new this();
        }
        return this._instance;
    }
    // #endregion

    jigsawVariables: Map<string, JigsawVariable> = new Map();
    private refKeyMap: Map<number, string> = new Map();
    private seqRefMap: Map<number, number> = new Map();

    private scopeTopVars: Set<string> = new Set();
    private scopeTopToggle: boolean = false;

    public updateVariable(variable: JigsawVariable, seq: number = -1) {
        const varValue: string = variable.value;
        let keyString: string = varValue.includes("@") ? varValue : variable.evaluateName;

        // If seq is given, update the existing variable that refers to the provided variable
        if (seq >= 0) {
            const ref: number | undefined = this.seqRefMap.get(seq);
            const varKey: string | undefined = ref == undefined ? undefined : this.refKeyMap.get(ref);
            const reffer: JigsawVariable | undefined = varKey ? this.jigsawVariables.get(varKey) : undefined;

            // If the maps chain correctly, the update should succeed
            if (reffer) {
                keyString = keyString.includes("@") ? keyString : reffer.value + "." + variable.name;
                reffer.setVariable(variable.name, keyString);
            }
        }

        this.jigsawVariables.set(keyString, variable);

        // Associate the ref with the variable
        this.refKeyMap.set(variable.variablesReference, keyString);

        if (this.scopeTopToggle) this.scopeTopVars.add(keyString);
    }

    public addSeq(seq: number, varsRef: number) {
        this.seqRefMap.set(seq, varsRef);
    }

    public clearVariables() {
        this.jigsawVariables.clear();
        this.refKeyMap.clear();
        this.seqRefMap.clear();

        this.scopeTopToggle = true;
    }

    public scopeTopToggleOff() {
        this.scopeTopToggle = false;
    }

    public isScopeTopVar(varKey: string): boolean {
        return this.scopeTopVars.has(varKey);
    }
}