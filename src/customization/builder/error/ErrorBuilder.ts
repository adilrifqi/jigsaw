import { ParserRuleContext } from "antlr4ts";

export class ErrorBuilder {
    protected ctx: ParserRuleContext;
    private message: string;

    constructor(ctx: ParserRuleContext, message: string) {
        this.ctx = ctx;
        this.message = message;
    }

    public toString(): string {
        return "(" + this.ctx.start.line + "," + this.ctx.start.charPositionInLine + "): "
            + this.message;
    }
}