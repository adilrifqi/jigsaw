import { Expr } from "./Expr";

export class NoneExpr extends Expr {
    public type(): null {
        return null;
    }

    public value(): null {
        return null;
    }

    public initialize(): void {
        throw new Error("Method not implemented.");
    }
}