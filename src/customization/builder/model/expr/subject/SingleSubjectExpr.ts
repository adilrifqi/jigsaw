import { Expr } from "../Expr";
import { ValueType } from "../ValueType";
import { LocationType } from "../../location/Location";
import { CustomizationRuntime, Subject } from "../../CustomizationRuntime";
import { RuntimeError } from "../../../error/RuntimeError";
import { ParserRuleContext } from "antlr4ts";
import { ArrayType } from "../collection/ArrayExpr";

export class SingleSubjectExpr extends Expr {
    private readonly subjectName: string;
    private readonly locationType: LocationType;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(subjectName: string, locationType: LocationType, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.subjectName = subjectName;
        this.locationType = locationType;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public type(): ValueType | ArrayType {
        if (this.locationType == LocationType.CLASS)
            return new ArrayType(ValueType.SUBJECT, 1);
        return ValueType.SUBJECT;
    }

    public eval(): Object {
        switch(this.locationType) {
            case LocationType.CLASS:
                return this.runtime.getSubjectsOfType(this.subjectName);
            case LocationType.FIELD:
            case LocationType.LOCAL:
                const getResult: Subject | null = this.locationType == LocationType.FIELD ? this.runtime.getField(this.subjectName) : this.runtime.getLocalVariable(this.subjectName);
                if (getResult === null) return new RuntimeError(this.ctx, "The subject with the path with name " + this.subjectName + " does not exist in this location scope.");
                return getResult;
        }

        return new RuntimeError(this.ctx, "Unknown location provided.");
    }

}