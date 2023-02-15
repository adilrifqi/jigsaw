import { RuntimeError } from "../../error/RuntimeError";
import { ArrayType } from "./ArrayExpr";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class AdditionExpr extends Expr {
    private readonly leftExpr: Expr;
    private readonly rightExpr: Expr;
    private readonly resultType: ValueType | ArrayType;

    constructor(leftExpr: Expr, rightExpr: Expr) {
        super();
        this.leftExpr = leftExpr;
        this.rightExpr = rightExpr;

        // Assume type-checking was already done
        // string + num = string
        // string + string = string
        // num + num = num
        // num + string = string
        // array + array = array
        const leftType: ValueType | ArrayType = this.leftExpr.type() as ValueType | ArrayType;
        const rightType: ValueType | ArrayType = this.rightExpr.type() as ValueType | ArrayType;

        if (leftType == ValueType.STRING) this.resultType = ValueType.STRING;
        else if (rightType == ValueType.STRING) this.resultType = ValueType.STRING;
        else this.resultType = leftType;
    }

    public type(): ValueType | ArrayType {
        return this.resultType;
    }

    public eval(): Object {
        const leftValue: Object = this.leftExpr.eval() as Object;
        if (leftValue instanceof RuntimeError) return leftValue;

        const rightValue: Object = this.rightExpr.eval() as Object;
        if (rightValue instanceof RuntimeError) return rightValue;

        if (this.resultType instanceof ArrayType) return (leftValue as any[]).concat(rightValue as any[]);
        else {
            const valueType: ValueType = this.resultType as ValueType;
            if (valueType == ValueType.NUM) return (leftValue as number) + (rightValue as number);
            else {
                if (this.leftExpr.type() == ValueType.STRING) {
                    if (this.rightExpr.type() == ValueType.NUM) return (leftValue as string) + (rightValue as number);
                    else return (leftValue as string) + (rightValue as string);
                } else return (leftValue as number) + (rightValue as string); 
            }
        }
    }
}