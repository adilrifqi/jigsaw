import { JigsawVariable } from "./JigsawVariable";

export class StackFrame {
    signature: MethodSignature;

    jigsawVariables: Map<string, JigsawVariable> = new Map();
    refKeyMap: Map<number, string> = new Map();
    seqRefMap: Map<number, number> = new Map();

    private lazyRefKeyMap: Map<number, string> = new Map();
    private lazySeqRefMap: Map<number, number> = new Map();

    private replaceVarsRefToVarKey: Map<number, string> = new Map();

    private scopeTopVars: Set<string> = new Set();
    private scopeTopToggle: boolean = true;

    frameId: number;

    constructor(frameId: number, signature: MethodSignature) {
        this.frameId = frameId;
        this.signature = signature;
    }

    public handleLazyFollowUp(seq: number, newVarsRef: number): boolean {
        if (this.lazySeqRefMap.has(seq)) {
            const originalVarsRef: number = this.lazySeqRefMap.get(seq)!;
            const varKey: string = this.lazyRefKeyMap.get(originalVarsRef)!;
            this.refKeyMap.set(newVarsRef, varKey);
            this.lazySeqRefMap.delete(seq);
            return true;
        }
        return false;
    }

    public setVariable(variable: JigsawVariable, seq: number = -1) {
        const varValue: string = variable.value;
        let keyString: string = varValue.includes("@") ? varValue : variable.evaluateName;

        // If seq is given, update the existing variable that refers to the provided variable
        if (seq >= 0) {
            const ref: number | undefined = this.seqRefMap.get(seq);
            var varKey: string | undefined = ref == undefined ? undefined : this.refKeyMap.get(ref);
            if (!varKey) {
                varKey = ref == undefined ? undefined : this.replaceVarsRefToVarKey.get(ref);
                if (varKey) {
                    const valReplacee: JigsawVariable | undefined = this.jigsawVariables.get(varKey);
                    if (valReplacee) valReplacee.value = variable.value;
                }
            } else {
                const reffer: JigsawVariable | undefined = varKey ? this.jigsawVariables.get(varKey) : undefined;

                // If the maps chain correctly, the update should succeed
                if (reffer) {
                    keyString = keyString.includes("@") ? keyString : reffer.value + "." + variable.name;
                    reffer.setVariable(variable.name, keyString);
                }
            }
        }

        if (!this.jigsawVariables.has(keyString)) {
            variable.id = keyString;
            this.jigsawVariables.set(keyString, variable);

            // Associate the ref with the variable
            if (variable.lazy) this.lazyRefKeyMap.set(variable.variablesReference, keyString);
            else this.refKeyMap.set(variable.variablesReference, keyString);
        }

        if (this.scopeTopToggle) this.scopeTopVars.add(keyString);
    }

    public addSeqRef(seq: number, varsRef: number) {
        var varKey: string | undefined = this.refKeyMap.get(varsRef);
        if (varKey != undefined) {
            this.seqRefMap.set(seq, varsRef);
            return;
        }

        varKey = this.lazyRefKeyMap.get(varsRef);
        if (varKey != undefined) this.lazySeqRefMap.set(seq, varsRef);
    }

    public addReplaceVarsRefToVarKey(replaceVarsRef: number, seq: number) {
        const oldVarsRef: number | undefined = this.seqRefMap.get(seq);
        const varKey: string | undefined = oldVarsRef == undefined ? undefined : this.refKeyMap.get(oldVarsRef);
        if (oldVarsRef != undefined && varKey) {
            this.replaceVarsRefToVarKey.set(replaceVarsRef, varKey);
            this.removeSeq(seq);
        }
    }

    public scopeTopToggleOff() {
        this.scopeTopToggle = false;
    }

    public isScopeTopVar(varKey: string): boolean {
        return this.scopeTopVars.has(varKey);
    }

    public complete(): boolean {
        return this.seqRefMap.size == 0 && this.lazySeqRefMap.size == 0;
    }

    public removeSeq(seq: number) {
        this.seqRefMap.delete(seq);
    }
}

export class MethodSignature {
    public readonly className: string;
    public readonly methodName: string;
    public readonly paramTypes: string[];

    constructor(className: string, methodName: string, paramTypes: string[]) {
        this.className = className;
        this.methodName = methodName;
        this.paramTypes = paramTypes;
    }

    public static extractSignature(signature: string): MethodSignature {
        const dotSplit: string[] = signature.split('.');
        const className: string = dotSplit[0];
        const lParSplit: string[] = dotSplit[1].split('(');
        const methodName: string = lParSplit[0];
        const paramsString: string = lParSplit[1].substring(0, lParSplit[1].length - 1);
        const paramTypes: string[] = paramsString.split(',');

        return new MethodSignature(className, methodName, paramTypes);
    }
}