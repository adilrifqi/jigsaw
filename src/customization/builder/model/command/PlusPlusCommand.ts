import { PlusPlusExpr } from "../expr/PlusPlusExpr";
import { Location } from "../location/Location";
import { Command } from "./Command";

export class PlusPlusCommand extends Command {
    private readonly plusPlusExpr: PlusPlusExpr;

    constructor(plusPlusExpr: PlusPlusExpr, location?: Location) {
        super(location);
        this.plusPlusExpr = plusPlusExpr;
    }

    public execute(): undefined {
        this.plusPlusExpr.eval();
        return undefined;
    }
}