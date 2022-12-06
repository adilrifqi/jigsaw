import { CustomizationRuntime } from "../CustomizationRuntime";
import { Variable } from "../RTLocationScope";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class VarRefExpr extends Expr {
    private readonly varName: string;
    private readonly varType: ValueType;
    private readonly runtime: CustomizationRuntime;

    constructor(varName: string, varType: ValueType, runtime: CustomizationRuntime) {
        super();
        this.varName = varName;
        this.varType = varType;
        this.runtime = runtime;
    }

    public type(): ValueType {
        return this.varType;
    }

    public value(): Object {
        const variable: Variable = this.runtime.getVariable(this.varName)!;
        return variable.value
    }

    public reset(): void {
    }
}