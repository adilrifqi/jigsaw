import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { ArrayType } from "./ArrayExpr";
import { Expr } from "./Expr";
import { SingleSubjectExpr } from "./SingleSubjectExpr";
import { ValueType } from "./ValueType";

export class SubjectExpr extends Expr {
    private readonly singleSubjectExpr: SingleSubjectExpr;
    private readonly fieldChain: string[];
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(singleSubjectExpr: SingleSubjectExpr, fieldChain: string[], runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.singleSubjectExpr = singleSubjectExpr;
        this.fieldChain = fieldChain;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public type(): ValueType | ArrayType {
        return this.singleSubjectExpr.type();
    }

    public eval(): Object {
        const singleSubjectResult: Object = this.singleSubjectExpr.eval();
        if (singleSubjectResult instanceof RuntimeError) return singleSubjectResult;
        const wasArray: boolean = Array.isArray(singleSubjectResult);
        const singleSubject: Subject[] = wasArray ? singleSubjectResult as Subject[] : [singleSubjectResult as Subject];

        const results: Subject[] = [];
        for (const currentSubject of singleSubject) {
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