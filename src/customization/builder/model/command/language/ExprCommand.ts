import { RuntimeError } from "../../../error/RuntimeError";
import { Expr } from "../../expr/Expr";
import { Command } from "./Command";

export class ExprCommand extends Command {
    private readonly expr: Expr;

    constructor(expr: Expr) {
        super();
        this.expr = expr;
    }

    public execute(): RuntimeError | undefined {
        const exprResult: Object | null = this.expr.eval();
        if (exprResult instanceof RuntimeError) return exprResult;
        return undefined;
    }
}