import { IntExpr } from "./IntExpr";

export class NegativeExpr extends IntExpr {
    private readonly toNegate: number;

    constructor(toNegate: number) {
        super();
        this.toNegate = toNegate;
    }

    public value(): number {
        return this.toNegate;
    }
}