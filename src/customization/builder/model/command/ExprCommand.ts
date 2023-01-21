import { RuntimeError } from "../../error/RuntimeError";
import { Expr } from "../expr/Expr";
import { Location } from "../location/Location";
import { Command } from "./Command";

export class ExprCommand extends Command {
    private readonly expr: Expr;

    constructor(expr: Expr, location?: Location) {
        super(location);
        this.expr = expr;
    }

    public execute(): RuntimeError | undefined {
        const exprResult: Object | null = this.expr.eval();
        if (exprResult instanceof RuntimeError) return exprResult;
        return undefined;
    }
}