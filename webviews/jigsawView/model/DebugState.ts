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
            this.variablesVarRefToFrameId.set(jigsawVariable.variablesReference, frameId);
            return frameId;
        }
        return -1;
    }


    public getFrameByPos(stackPos: number): StackFrame | undefined {
        return this.callStack.get(this.currentSmallestFrameId + stackPos);
    }

    public getFrameById(frameId: number): StackFrame | undefined {
        return this.callStack.get(frameId);
    }


    public clear() {
        this.callStack.clear();
        this.currentSmallestFrameId = -1;
        
        this.scopesSeqToFrameId.clear();
        this.scopesVarRefToFrameId.clear();
        this.variablesSeqToFrameId.clear();
        this.variablesVarRefToFrameId.clear();
    }
}