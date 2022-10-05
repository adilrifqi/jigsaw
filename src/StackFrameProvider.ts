import { Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from "vscode";

export class StackFrameProvider implements TreeDataProvider<StackFrame> {
    private _stackFrameNames: string[] = [];

    private _onDidChangeTreeData: EventEmitter<void | StackFrame | null | undefined> = new EventEmitter<void | StackFrame | null | undefined>();
    readonly onDidChangeTreeData: Event<void | StackFrame | null | undefined> = this._onDidChangeTreeData.event;

    public updateStackFrameNames(stackFrameNames: string[]) {
        this._stackFrameNames = stackFrameNames;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: StackFrame): TreeItem | Thenable<TreeItem> {
        return element;
    }

    getChildren(element?: StackFrame | undefined): ProviderResult<StackFrame[]> {
        const stackFrames: StackFrame[] = [];
        for (var stackFrameName of this._stackFrameNames) {
            stackFrames.push(new StackFrame(stackFrameName));
        }
        return Promise.resolve(stackFrames);
    }
}

class StackFrame extends TreeItem {
    constructor(public readonly label: string) {
        super(label, TreeItemCollapsibleState.None);
    }
}