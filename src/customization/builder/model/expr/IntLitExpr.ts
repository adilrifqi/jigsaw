import { IntExpr } from "./IntExpr";

export class IntLitExpr extends IntExpr {
    private readonly intValue: number;

    constructor(intValue: number) {
        super();
        this.intValue = intValue;
    }

    public value(): number {
        return this.intValue;
    }
}