import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { ArrayType } from "./ArrayExpr";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class ParentsOfExpr extends Expr {
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

        const result: Subject[] = [];
        for (const [parentVarKey, _] of this.runtime.getParentsOf(subject))
            result.push({id: parentVarKey});
        return result;
    }
}