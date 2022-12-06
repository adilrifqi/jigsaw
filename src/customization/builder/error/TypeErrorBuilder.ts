import { ParserRuleContext } from "antlr4ts";
import { ValueType } from "../model/expr/ValueType";
import { ErrorBuilder } from "./ErrorBuilder";

export class TypeErrorBuilder extends ErrorBuilder {
    constructor(ctx: ParserRuleContext, expecteds: ValueType[], given: ValueType) {
        super(ctx, "Expected type(s) " + expecteds + " but was given type " + given + ".");
    }
}