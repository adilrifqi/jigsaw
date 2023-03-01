import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { ArrayType } from "./ArrayExpr";
import { Expr } from "./Expr";
import { MapType } from "./NewMapExpr";
import { ValueType } from "./ValueType";

export class ValueOfExpr extends Expr {
    private readonly subjectExpr: Expr;
    private readonly declaredType: ValueType | ArrayType | MapType;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(subjectExpr: Expr, declaredType: ValueType | ArrayType | MapType, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.subjectExpr = subjectExpr;
        this.declaredType = declaredType;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public type(): ValueType | ArrayType | MapType {
        return this.declaredType;
    }

    public eval(): Object | null {
        const subjectExprValue: Object = this.subjectExpr.eval() as Object;
        if (subjectExprValue instanceof RuntimeError) return subjectExprValue;
        if (subjectExprValue === null) {
            switch (this.type()) {
                // NUM, BOOLEAN, STRING, NODE, EDGE, SUBJECT
                case ValueType.NUM: return 0;
                case ValueType.BOOLEAN: return false;
                case ValueType.STRING: return "null";
                case ValueType.NODE: return null;
                case ValueType.EDGE: return null;
                case ValueType.SUBJECT: return null;
                default: return null;
            }
        }

        const subjectValue: {value: Object, type: ValueType | ArrayType | MapType} | null = this.runtime.getSubjectValue(subjectExprValue as Subject);
        if (subjectValue === null) return new RuntimeError(this.ctx, "Cannot get the value the subject of the variable of this type.");

        if (!this.validType(this.declaredType, subjectValue.type))
            return new RuntimeError(this.ctx, "The value " + subjectValue + " does not match the declared type " + this.declaredType);

        return subjectValue.value;
    }

    private validType(declaredType: ValueType | ArrayType | MapType, foundType: ValueType | ArrayType | MapType): boolean {
        if (declaredType instanceof ArrayType) {
            if (!(foundType instanceof ArrayType)) return false;
            if (foundType.type !== undefined) {
                if (JSON.stringify(declaredType) !== JSON.stringify(foundType)) return false;
            } else if (foundType.dimension > declaredType.dimension) return false;
            return true;
        } else if (declaredType instanceof MapType) {
            if (!(foundType instanceof MapType)) return false;
            if (foundType.keyType === undefined && foundType.valueType === undefined) return true;
            if (foundType.keyType === undefined || foundType.valueType === undefined) return false;
            if (declaredType.keyType === undefined || declaredType.valueType === undefined) return false;
            return this.validType(declaredType.keyType, foundType.keyType) && this.validType(declaredType.valueType!, foundType.valueType);
        } else return declaredType == foundType;
    }
}