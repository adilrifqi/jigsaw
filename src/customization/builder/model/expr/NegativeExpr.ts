import { NumExpr } from "./NumExpr";

export class NegativeExpr extends NumExpr {
    private readonly toNegate: number;

    constructor(toNegate: number) {
        super();
        this.toNegate = toNegate;
    }

    public value(): number {
        return this.toNegate;
    }
}