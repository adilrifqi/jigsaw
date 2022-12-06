import { NodeInfo } from "../../../../debugmodel/DiagramInfo";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class HereExpr extends Expr {
    private readonly runtime: CustomizationRuntime;

    constructor(runtime: CustomizationRuntime) {
        super();
        this.runtime = runtime;
    }
    
    public type(): ValueType {
        return ValueType.NODE;
    }

    public value(): NodeInfo | null {
        return this.runtime.getCurrentVariableNode();
    }

    public reset(): void {
    }
}