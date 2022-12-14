import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class HereExpr extends Expr {
    private readonly runtime: CustomizationRuntime;

    constructor(runtime: CustomizationRuntime) {
        super();
        this.runtime = runtime;
    }

    public type(): ValueType {
        return ValueType.SUBJECT;
    }

    public eval(): Subject {
        return this.runtime.getCurrentSubject();
    }
}