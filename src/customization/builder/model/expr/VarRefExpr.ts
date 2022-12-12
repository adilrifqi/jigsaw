import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Variable } from "../RTLocationScope";
import { ArrayType } from "./ArrayExpr";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class VarRefExpr extends Expr {
    private readonly varName: string;
    private readonly varType: ValueType | ArrayType;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(varName: string, varType: ValueType | ArrayType, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.varName = varName;
        this.varType = varType;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public type(): ValueType | ArrayType {
        return this.varType;
    }

    public eval(): Object | null {
        const variable: Variable | undefined = this.runtime.getVariable(this.varName);
        if (!variable)
            return new RuntimeError(this.ctx, "Somehow variable " + this.varName + " does not exist in runtime");
        return variable.value
    }
}