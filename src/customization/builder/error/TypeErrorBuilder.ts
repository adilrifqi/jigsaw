import { ParserRuleContext } from "antlr4ts";
import { ArrayType } from "../model/expr/collection/ArrayExpr";
import { MapType } from "../model/expr/collection/NewMapExpr";
import { ValueType } from "../model/expr/ValueType";
import { ErrorBuilder } from "./ErrorBuilder";

export class TypeErrorBuilder extends ErrorBuilder {
    constructor(ctx: ParserRuleContext, expecteds: (ValueType | ArrayType | MapType)[], given: ValueType | ArrayType | MapType) {
        super(ctx, "Expected type(s) " + expecteds + " but was given type " + given + ".");
    }
}