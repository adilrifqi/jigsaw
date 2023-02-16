import { Recognizer, RecognitionException, Parser, Lexer } from 'antlr4ts'
import { ANTLRErrorListener } from 'antlr4ts/ANTLRErrorListener'

export class ThrowingErrorListener<T> implements ANTLRErrorListener<T> {
    public static readonly instance: ThrowingErrorListener<Object> = new ThrowingErrorListener();

    syntaxError<P extends T>(recognizer: Recognizer<T, any>, offendingSymbol: T | undefined, line: number, charPositionInLine: number, msg: string, e: RecognitionException | undefined) {
        var errorTypeString: string = "Error";
        if (recognizer instanceof Parser) errorTypeString = "Parser " + errorTypeString;
        else if (recognizer instanceof Lexer) errorTypeString = "Lexer " + errorTypeString;
        throw new Error(errorTypeString + " at (" + line + ":" + charPositionInLine + "): " + msg);
    }
}