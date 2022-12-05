import { CustomizationRuntime } from "../CustomizationRuntime";
import { Expr } from "../expr/Expr";
import { ValueType } from "../expr/ValueType";
import { Location } from "../location/Location";
import { Node } from "../Node";
import { Command } from "./Command";

export class AddCommand extends Command {
    private readonly expr: Expr;
    private readonly runtime: CustomizationRuntime;

    constructor(expr: Expr, runtime: CustomizationRuntime, location: Location) {
        super(location);
        this.expr = expr;
        this.runtime = runtime;
    }

    public execute(): boolean {
        // TODO: Implement
        if (this.expr.type() == ValueType.NODE) {
            this.runtime.addNode(this.expr.value() as Node);
            return true;
        }
        throw new Error("Method not implemented.");
    }
}