import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../../CustomizationRuntime";
import { ArrayType } from "../collection/ArrayExpr";
import { Expr } from "../Expr";
import { ValueType } from "../ValueType";

export class FieldChainExpr extends Expr {
    private readonly suffixedExpr: Expr;
    private readonly fieldChain: string[];
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(suffixedExpr: Expr, fieldChain: string[], runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.suffixedExpr = suffixedExpr;
        this.fieldChain = fieldChain;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public type(): ValueType | ArrayType {
        return this.suffixedExpr.type() as ValueType | ArrayType;
    }

    public eval(): Object {
        const suffixedResult: Object = this.suffixedExpr.eval() as Object;
        if (suffixedResult instanceof RuntimeError) return suffixedResult;
        const wasArray: boolean = Array.isArray(suffixedResult);
        const suffixed: Subject[] = wasArray ? suffixedResult as Subject[] : [suffixedResult as Subject];

        const results: Subject[] = [];
        for (const currentSubject of suffixed) {
            var result: Subject | null = currentSubject;
            for (var i = 0; i < this.fieldChain.length && result !== null; i++) {
                result = this.runtime.getField(this.fieldChain[i], result);
                if (result === null) return new RuntimeError(this.ctx, "The subject with the path with name " + this.fieldChain[i] + " does not exist in this location scope.");
            }
            results.push(result);
        }

        if (!wasArray) return results[0];
        else return results;
    }
}