import { NodeInfo } from "../../../../debugmodel/DiagramInfo";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Expr } from "../expr/Expr";
import { ValueType } from "../expr/ValueType";
import { Location } from "../location/Location";
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
        this.expr.reset();
        if (this.expr.type() == ValueType.NODE) {
            const nodeValue: Object | null = this.expr.value();
            if (nodeValue !== null && nodeValue !== undefined)  
                this.runtime.addNode(nodeValue as NodeInfo);
            return true;
        }
        throw new Error("Method not implemented.");
    }
}