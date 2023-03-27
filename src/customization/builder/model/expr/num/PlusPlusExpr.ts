import { CustomizationRuntime } from "../../CustomizationRuntime";
import { ValueType } from "../ValueType";
import { NumExpr } from "./NumExpr";

export class PlusPlusExpr extends NumExpr {
    private readonly varName: string;
    private readonly inc: boolean;
    private readonly opFirst: boolean;
    private readonly runtime: CustomizationRuntime;

    constructor(varName: string, inc: boolean, opFirst: boolean, runtime: CustomizationRuntime) {
        super();
        this.varName = varName;
        this.inc = inc;
        this.opFirst = opFirst;
        this.runtime = runtime;
    }

    public eval(): Object {
        const currValue: number = this.runtime.getVariable(this.varName)!.value as number;
        var result: number = currValue;

        if (this.opFirst)
            if (this.inc) result++;
            else result--;

        this.runtime.reassignVariable(this.varName, ValueType.NUM, this.inc ? currValue + 1 : currValue - 1);

        return result;
    }
}