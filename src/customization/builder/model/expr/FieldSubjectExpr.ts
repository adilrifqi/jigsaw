import { CustomizationRuntime } from "../CustomizationRuntime";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class FieldSubjectExpr extends Expr {
    private readonly fieldName: string;
    private readonly runtime: CustomizationRuntime;

    constructor(fieldName: string, runtime: CustomizationRuntime) {
        super();
        this.fieldName = fieldName;
        this.runtime = runtime;
    }

    public type(): ValueType {
        return ValueType.SUBJECT;
    }

    public eval(): Object | null {
        return this.runtime.getCurrentVariableField(this.fieldName);
    }
}