import { ParserRuleContext } from "antlr4ts";

export class ErrorBuilder {
    protected readonly ctx: ParserRuleContext;
    protected readonly message: string;
    protected readonly totalErrorMessage: string;

    constructor(ctx: ParserRuleContext, message: string) {
        this.ctx = ctx;
        this.message = message;
        this.totalErrorMessage = "(" + this.ctx.start.line + "," +
            this.ctx.start.charPositionInLine + "): " + this.message;
    }

    public toString(): string {
        return this.totalErrorMessage;
    }
}