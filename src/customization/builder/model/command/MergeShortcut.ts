import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { Expr } from "../expr/Expr";
import { Command } from "./Command";

export class MergeShortcut extends Command {
    private readonly mergedExpr: Expr;
    private readonly runtime: CustomizationRuntime;

    constructor(mergedExpr: Expr, runtime: CustomizationRuntime) {
        super();
        this.mergedExpr = mergedExpr;
        this.runtime = runtime;
    }

    public execute(): RuntimeError | undefined {
        const mergedResult: Object = this.mergedExpr.eval() as Object;
        if (mergedResult instanceof RuntimeError) return mergedResult;
        const targetSubjects: Subject[] = Array.isArray(mergedResult) ? mergedResult as Subject[] : [mergedResult as Subject];

        this.runtime.merge(targetSubjects);
        return undefined;
    }
}