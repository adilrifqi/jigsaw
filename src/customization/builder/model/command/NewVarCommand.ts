import { CustomizationRuntime } from "../CustomizationRuntime";
import { Expr } from "../expr/Expr";
import { Location } from "../location/Location";
import { Command } from "./Command";

export class NewVarCommand extends Command {
    private readonly varName: string;
    private readonly expr: Expr;
    private readonly runtime: CustomizationRuntime;

    constructor(varName: string, expr: Expr, runtime: CustomizationRuntime, location: Location) {
        super(location);
        this.varName = varName;
        this.expr = expr;
        this.runtime = runtime;
    }
    
    public execute(): boolean {
        this.expr.initialize();
        return this.runtime.addVarible(
            this.varName,
            this.expr.type(),
            this.expr.value()
        );
    }
}