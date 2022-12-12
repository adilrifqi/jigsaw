import { EdgeInfo, NodeInfo } from "../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../error/RuntimeError";
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

    public execute(): RuntimeError | undefined {
        this.expr.reset();
        const value: Object | null = this.expr.value();
        if (value instanceof RuntimeError) return value;

        if (value !== null && value !== undefined) {
            if (this.expr.type() == ValueType.NODE)
                this.runtime.omitNode(value as NodeInfo);
            else this.runtime.omitEdge(value as EdgeInfo);
        }

        return undefined;
    }
}