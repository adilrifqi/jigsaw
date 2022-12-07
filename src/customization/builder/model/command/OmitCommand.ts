import { EdgeInfo, NodeInfo } from "../../../../debugmodel/DiagramInfo";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Expr } from "../expr/Expr";
import { ValueType } from "../expr/ValueType";
import { Location } from "../location/Location";
import { Command } from "./Command";

export class OmitCommand extends Command {
    private readonly expr: Expr;
    private readonly runtime: CustomizationRuntime;

    constructor(expr: Expr, runtime: CustomizationRuntime, location: Location) {
        super(location);
        this.expr = expr;
        this.runtime = runtime;
    }

    public execute(): boolean {
        this.expr.reset();
        const value: Object | null = this.expr.value();
        if (this.expr.type() == ValueType.NODE) {
            if (value !== null && value !== undefined)
                return this.runtime.omitNode(value as NodeInfo);
            return false;
        } else {
            if (value !== null && value !== undefined)
                return this.runtime.omitEdge(value as EdgeInfo);
            return false;
        }
    }
}