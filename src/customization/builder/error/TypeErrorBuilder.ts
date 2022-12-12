import { ParserRuleContext } from "antlr4ts";
import { ArrayType } from "../model/expr/ArrayExpr";
import { ValueType } from "../model/expr/ValueType";
import { ErrorBuilder } from "./ErrorBuilder";

export class TypeErrorBuilder extends ErrorBuilder {
    constructor(ctx: ParserRuleContext, expecteds: (ValueType | ArrayType)[], given: ValueType | ArrayType) {
        super(ctx, "Expected type(s) " + expecteds + " but was given type " + given + ".");
    }
}