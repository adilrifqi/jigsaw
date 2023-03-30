import { NodeInfo } from "../../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../../CustomizationRuntime";
import { ArrayType } from "../collection/ArrayExpr";
import { Expr } from "../Expr";
import { ValueType } from "../ValueType";

export class InlineShortcutExpr extends Expr {
    private readonly target: Expr;
    private readonly runtime: CustomizationRuntime;

    constructor(target: Expr, runtime: CustomizationRuntime) {
        super();
        this.target = target;
        this.runtime = runtime;
    }

    public type(): ArrayType {
        return new ArrayType(ValueType.NODE, 1);
    }

    public eval(): Object {
        const targetValue: Object | null = this.target.eval();
        if (targetValue instanceof RuntimeError) return targetValue;
        const targets: (NodeInfo | null)[] | Subject[] = !Array.isArray(targetValue) ? [targetValue] : targetValue;

        return this.runtime.inlineShownNodes(targets);
    }
}