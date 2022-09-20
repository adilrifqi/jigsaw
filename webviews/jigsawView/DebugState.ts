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
    // TODO: map from seq to @ to populate map of each JigsawVariables

    public updateVariable(variable: JigsawVariable) {
        const varValue: string = variable.name;
        if (varValue.includes("@")) {
            this.jigsawVariables.set(varValue, variable);
        } else {
            this.jigsawVariables.set(variable.evaluateName, variable);
        }
    }
}