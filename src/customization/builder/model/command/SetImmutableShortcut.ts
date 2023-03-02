import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { Expr } from "../expr/Expr";
import { Command } from "./Command";

export class SetImmutableShortcut extends Command {
    private readonly targetSubjectExpr: Expr; // Accepts subject or list of subjects
    private readonly runtime: CustomizationRuntime;

    constructor(targetSubjectExpr: Expr, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.targetSubjectExpr = targetSubjectExpr;
        this.runtime = runtime;
    }

    public execute(): RuntimeError | undefined {
        const targetSubjectResult: Object = this.targetSubjectExpr.eval() as Object;
        if (targetSubjectResult instanceof RuntimeError) return targetSubjectResult;
        const targetSubjects: Subject[] = Array.isArray(targetSubjectResult) ? targetSubjectResult as Subject[] : [targetSubjectResult as Subject];

        this.runtime.setImmutable(targetSubjects);
        return undefined;
    }
}