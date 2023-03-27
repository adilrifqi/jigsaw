import { RuntimeError } from "../../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../../CustomizationRuntime";
import { Expr } from "../Expr";
import { ValueType } from "../ValueType";

export class IsNullExpr extends Expr {
    private readonly expr: Expr;
    private readonly runtime: CustomizationRuntime;

    constructor(expr: Expr, runtime: CustomizationRuntime) {
        super();
        this.expr = expr;
        this.runtime = runtime;
    }

    public type(): ValueType {
        return ValueType.BOOLEAN;
    }

    public eval(): Object {
        const exprValue: Object | null = this.expr.eval();
        if (exprValue === null) return true;
        if (exprValue instanceof RuntimeError) return exprValue;

        return this.runtime.subjectValueIsNull(exprValue as Subject);
    }
}