import { PlusPlusExpr } from "../expr/PlusPlusExpr";
import { Command } from "./Command";

export class PlusPlusCommand extends Command {
    private readonly plusPlusExpr: PlusPlusExpr;

    constructor(plusPlusExpr: PlusPlusExpr) {
        super();
        this.plusPlusExpr = plusPlusExpr;
    }

    public execute(): undefined {
        this.plusPlusExpr.eval();
        return undefined;
    }
}