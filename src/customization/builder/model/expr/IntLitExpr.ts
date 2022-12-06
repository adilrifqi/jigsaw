import { NumExpr } from "./NumExpr";

export class IntLitExpr extends NumExpr {
    private readonly intValue: number;

    constructor(intValue: number) {
        super();
        this.intValue = intValue;
    }

    public value(): number {
        return this.intValue;
    }

    public reset(): void {
    }
}