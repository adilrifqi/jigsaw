import { CustomizationRuntime } from "../CustomizationRuntime";
import { Variable } from "../RTLocationScope";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class VarRefExpr extends Expr {
    private readonly varName: string;
    private readonly varType: ValueType | null;
    private readonly runtime: CustomizationRuntime;

    constructor(varName: string, varType: ValueType | null, runtime: CustomizationRuntime) {
        super();
        this.varName = varName;
        this.varType = varType;
        this.runtime = runtime;
    }

    public type(): ValueType | null {
        return this.varType;
    }

    public value(): Object | null {
        const variable: Variable | undefined = this.runtime.getVariable(this.varName);
        if (variable) return variable.value;
        return null;
    }

    public initialize(): void {
    }
    
}