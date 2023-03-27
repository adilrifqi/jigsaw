import { RuntimeError } from "../../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../../CustomizationRuntime";
import { ArrayType } from "../collection/ArrayExpr";
import { Expr } from "../Expr";
import { ValueType } from "../ValueType";

export class ChildrenOfExpr extends Expr {
    private readonly subjectExpr: Expr;
    private readonly runtime: CustomizationRuntime;

    constructor(subjectExpr: Expr, runtime: CustomizationRuntime) {
        super();
        this.subjectExpr = subjectExpr;
        this.runtime = runtime;
    }

    public type(): ArrayType {
        return new ArrayType(ValueType.SUBJECT, 1);
    }

    public eval(): Object {
        const subjectExpr: Object = this.subjectExpr.eval() as Object;
        if (subjectExpr instanceof RuntimeError) return subjectExpr;
        if (subjectExpr === null) return [];
        const subject: Subject = subjectExpr as Subject;
        return this.runtime.getChildrenOf(subject);
    }
}