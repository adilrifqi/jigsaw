import { RuntimeError } from "../../../error/RuntimeError";
import { Expr } from "../../expr/Expr";
import { Command } from "../language/Command";

export class CustExprCommand extends Command {
    private readonly custExpr: Expr;

    constructor(custExpr: Expr) {
        super();
        this.custExpr = custExpr;
    }

    public execute(): RuntimeError | undefined {
        const custResult: Object | null = this.custExpr.eval();
        if (custResult instanceof RuntimeError) return custResult;
        return undefined;
    }
}