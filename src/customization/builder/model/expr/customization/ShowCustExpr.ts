import { ParserRuleContext } from "antlr4ts";
import { EdgeInfo, NodeInfo } from "../../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../../CustomizationRuntime";
import { ArrayType } from "../collection/ArrayExpr";
import { Expr } from "../Expr";
import { ValueType } from "../ValueType";

export class ShowCustExpr extends Expr {
    private readonly expr: Expr;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(expr: Expr, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.expr = expr;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public type(): ValueType | ArrayType {
        const type: ValueType | ArrayType = this.expr.type() as ValueType | ArrayType;

        if (type instanceof ArrayType) {
            if (type.type == ValueType.EDGE)
                return new ArrayType(ValueType.EDGE, 1);
            return new ArrayType(ValueType.NODE, 1);
        }

        if (type == ValueType.EDGE) return ValueType.EDGE;
        return ValueType.NODE;
    }

    public eval(): Object | null {
        const value: Object | null = this.expr.eval();
        if (value instanceof RuntimeError) return value;
        const exprType: ValueType | ArrayType = this.expr.type() as ValueType | ArrayType;

        if (exprType instanceof ArrayType) {
            if (exprType.dimension != 1)
                return new RuntimeError(this.ctx, "For some reason, the detected dimension for the add command is not 1, but is instead " + exprType.dimension);

            const result: (NodeInfo | EdgeInfo | null)[] = []; // TODO: Check type
            const toShow: NodeInfo[] | Subject[] | EdgeInfo[] = value as NodeInfo[] | Subject[] | EdgeInfo[];
            for (const obj of toShow)
                result.push(this.runtime.showDispatch(obj));

            return result;
        }

        return this.runtime.showDispatch(value as NodeInfo | EdgeInfo | Subject | null);
    }
}