import { BooleanExpr } from "./BooleanExpr";

export class NotExpr extends BooleanExpr {
    private readonly toNot: boolean;

    constructor(toNot: boolean) {
        super();
        this.toNot = toNot;
    }

    public value(): boolean {
        return this.toNot;
    }
}