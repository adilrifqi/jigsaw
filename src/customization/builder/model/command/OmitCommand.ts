import { CustomizationRuntime } from "../CustomizationRuntime";
import { Expr } from "../expr/Expr";
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
        // TODO: Implement
        throw new Error("Method not implemented.");
    }
}