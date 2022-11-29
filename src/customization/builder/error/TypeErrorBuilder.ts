import { ParserRuleContext } from "antlr4ts";
import { ValueType } from "../model/expr/ValueType";
import { ErrorBuilder } from "./ErrorBuilder";

export class TypeErrorBuilder extends ErrorBuilder {
    constructor(ctx: ParserRuleContext, expecteds: (ValueType | null)[], given: ValueType | null) {
        super(ctx, "Expected type(s) " + expecteds + " but was given type " + (given != null ? given : "none") + ".");
    }
}