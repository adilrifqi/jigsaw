import { ParserRuleContext } from "antlr4ts";
import { ErrorBuilder } from "./ErrorBuilder";

export class RuntimeError extends ErrorBuilder {
    constructor(ctx: ParserRuleContext, message: string) {
        super(ctx, message);
    }
}