import { ConsoleReporter } from "@vscode/test-electron";
import { JigsawVariable } from "./JigsawVariable";
import { StackFrame } from "./StackFrame";

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

    callStack: Map<number, StackFrame> = new Map(); // frameId -> StackFrame
    private currentSmallestFrameId: number = -1;

    private scopesSeqToFrameId: Map<number, number> = new Map();
    private scopesVarRefToFrameId: Map<number, number> = new Map();

    private variablesSeqToFrameId: Map<number, number> = new Map();
    private variablesVarRefToFrameId: Map<number, number> = new Map();

    private frameIdToStructVars: Map<number, Set<string>> = new Map();

    private valReplaceVarsRefToFrameId: Map<number, number> = new Map();

    private pendingVarsRefs: Set<number> = new Set();

    public setCallStack(newCallStack: Map<number, StackFrame>) {
        this.callStack = newCallStack;
        this.currentSmallestFrameId = Math.min(...this.callStack.keys());
    }

    public setScopesSeqToFrameId(seq: number, frameId: number) {
        this.scopesSeqToFrameId.set(seq, frameId);
    }

    public setScopesVarRefToFrameId(variablesReference: number, requestSeq: number) {
        const frameId: number | undefined = this.scopesSeqToFrameId.get(requestSeq);
        if (frameId)
            this.scopesVarRefToFrameId.set(variablesReference, frameId);
    }

    public setVariablesSeqToFrameId(seq: number, variablesReference: number) {
        this.pendingVarsRefs.delete(variablesReference);
        var frameId: number | undefined = this.scopesVarRefToFrameId.get(variablesReference);
        frameId = frameId == undefined ? this.variablesVarRefToFrameId.get(variablesReference) : frameId;
        if (frameId) {
            this.variablesSeqToFrameId.set(seq, frameId);
            this.callStack.get(frameId)?.addSeqRef(seq, variablesReference);
        }
    }

    public setVariableToFrame(jigsawVariable: JigsawVariable, requestSeq: number): number {
        const frameId: number | undefined = this.variablesSeqToFrameId.get(requestSeq);
        if (frameId) {
            this.callStack.get(frameId)?.setVariable(jigsawVariable, requestSeq);
            if (jigsawVariable.variablesReference > 0) this.variablesVarRefToFrameId.set(jigsawVariable.variablesReference, frameId);
            return frameId;
        }
        return -1;
    }

    public addFrameIdToStructVars(seq: number) {
        const frameId: number | undefined = this.variablesSeqToFrameId.get(seq);
        if (frameId && !this.frameIdToStructVars.has(frameId)) this.frameIdToStructVars.set(frameId, new Set());
    }

    public correlateFrameIdToStructVar(seq: number, structVarKey: string) {
        const frameId: number | undefined = this.variablesSeqToFrameId.get(seq);
        if (frameId)this.frameIdToStructVars.get(frameId)?.add(structVarKey);
    }

    public frameHasStructVar(seq: number, structVarKey: string): boolean {
        const frameId: number | undefined = this.variablesSeqToFrameId.get(seq);
        return (
            frameId != undefined
            && this.frameIdToStructVars.has(frameId)
            && this.frameIdToStructVars.get(frameId)!.has(structVarKey)
        );
    }


    public getFrameByPos(stackPos: number): StackFrame | undefined {
        return this.callStack.get(this.currentSmallestFrameId + stackPos);
    }

    public getFrameById(frameId: number): StackFrame | undefined {
        return this.callStack.get(frameId);
    }

    public complete(): boolean {
        if (this.pendingVarsRefs.size > 0) return false;
        for (const stackFrame of this.callStack.values()) {
            if (!stackFrame.complete()) {
                return false;
            }
        }
        return true;
    }
    
    public removeSeqFromFrame(seq: number) {
        const frameId: number | undefined = this.variablesSeqToFrameId.get(seq);
        if (frameId) this.callStack.get(frameId)?.removeSeq(seq);
    }

    public addReplaceVarsRefToVarKey(replaceVarsRef: number, seq: number) {
        const frameId: number | undefined = this.variablesSeqToFrameId.get(seq);
        if (frameId) this.callStack.get(frameId)?.addReplaceVarsRefToVarKey(replaceVarsRef, seq);
    }

    public setVariablesVarsRefToFrameId(varsRef: number, seq: number) {
        const frameId: number | undefined = this.variablesSeqToFrameId.get(seq);
        if (frameId) this.variablesVarRefToFrameId.set(varsRef, frameId);
    }

    public addPendingVarsRef(varsRef: number) {
        this.pendingVarsRefs.add(varsRef);
    }

    public getCurrentSmallestFrameId(): number {
        return this.currentSmallestFrameId;
    }

    public handleLazyFollowUp(seq: number, newVarsRef: number): boolean {
        const frameId: number | undefined = this.variablesSeqToFrameId.get(seq);
        if (frameId) {
            this.variablesVarRefToFrameId.set(newVarsRef, frameId);
            return this.callStack.get(frameId)!.handleLazyFollowUp(seq, newVarsRef);
        }
        return false;
    }


    public clear() {
        this.callStack.clear();
        this.currentSmallestFrameId = -1;
        
        this.scopesSeqToFrameId.clear();
        this.scopesVarRefToFrameId.clear();
        this.variablesSeqToFrameId.clear();
        this.variablesVarRefToFrameId.clear();
        this.frameIdToStructVars.clear();
        this.valReplaceVarsRefToFrameId.clear();
    }
}