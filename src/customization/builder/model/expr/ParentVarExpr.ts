import { CustomizationRuntime } from "../CustomizationRuntime";
import { ArrayType } from "./ArrayExpr";
import { Expr } from "./Expr";
import { MapType } from "./NewMapExpr";
import { ValueType } from "./ValueType";

export class ParentVarExpr extends Expr {
    private readonly targetVarName: string;
    private readonly varType: ValueType | ArrayType | MapType;
    private readonly upwardCount: number;
    private readonly runtime: CustomizationRuntime;

    constructor(targetVarName: string, varType: ValueType | ArrayType | MapType, upwardCount: number, runtime: CustomizationRuntime) {
        super();
        this.targetVarName = targetVarName;
        this.varType = varType;
        this.upwardCount = upwardCount;
        this.runtime = runtime;
    }

    public type(): ValueType | ArrayType | MapType {
        return this.varType;
    }

    public eval(): Object | null {
        return this.runtime.getAncestorLocationVariable(this.targetVarName, this.upwardCount);
    }
}