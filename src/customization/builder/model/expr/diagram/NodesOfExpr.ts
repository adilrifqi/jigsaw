import { RuntimeError } from "../../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../../CustomizationRuntime";
import { ArrayType } from "../collection/ArrayExpr";
import { Expr } from "../Expr";
import { ValueType } from "../ValueType";

export class NodesOfExpr extends Expr {
    private readonly subjectsExpr: Expr;
    private readonly runtime: CustomizationRuntime;

    constructor(subjectsExpr: Expr, runtime: CustomizationRuntime) {
        super();
        this.subjectsExpr = subjectsExpr;
        this.runtime = runtime;
    }

    public type(): ArrayType {
        return new ArrayType(ValueType.NODE, 1);
    }

    public eval(): Object {
        const subjectsResult: Object = this.subjectsExpr.eval() as Object;
        if (subjectsResult instanceof RuntimeError) return subjectsResult;
        const subjects: Subject[] = subjectsResult as Subject[];

        return this.runtime.getNodes(subjects.map(s => s.id));
    }
}