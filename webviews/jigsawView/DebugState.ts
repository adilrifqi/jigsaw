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

    variables: { [key: string]: string }[] = [];
}