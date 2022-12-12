import { NumExpr } from "./NumExpr";

export class IntLitExpr extends NumExpr {
    private readonly intValue: number;

    constructor(intValue: number) {
        super();
        this.intValue = intValue;
    }

    public eval(): number {
        return this.intValue;
    }
}