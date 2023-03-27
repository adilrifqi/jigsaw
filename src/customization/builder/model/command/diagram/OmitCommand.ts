import { ParserRuleContext } from "antlr4ts";
import { EdgeInfo, NodeInfo } from "../../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../../CustomizationRuntime";
import { ArrayType } from "../../expr/collection/ArrayExpr";
import { MapType } from "../../expr/collection/NewMapExpr";
import { Expr } from "../../expr/Expr";
import { ValueType } from "../../expr/ValueType";
import { Command } from "../language/Command";

export class OmitCommand extends Command {
    private readonly expr: Expr;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(expr: Expr, runtime: CustomizationRuntime, ctx: ParserRuleContext) {
        super();
        this.expr = expr;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public execute(): RuntimeError | undefined {
        const value: Object | null = this.expr.eval();
        if (value instanceof RuntimeError) return value;
        const exprType: ValueType | ArrayType | MapType = this.expr.type();

        if (exprType instanceof ArrayType) {
            const arrayType: ArrayType = exprType as ArrayType;
            if (arrayType.dimension != 1)
                return new RuntimeError(this.ctx, "For some reason, the detected dimension for the omit command is not 1, but is instead " + arrayType.dimension);
            else if (arrayType.type == ValueType.NODE)
                this.runtime.omitNodes(value as NodeInfo[]);
            else if (arrayType.type == ValueType.EDGE)
                this.runtime.omitEdges(value as EdgeInfo[]);
            else this.runtime.omitSubjectsNodes(value as Subject[]);
        } else {
            if (value !== null && value !== undefined) {
                if (this.expr.type() == ValueType.NODE)
                    this.runtime.omitNode(value as NodeInfo);
                else if (this.expr.type() == ValueType.EDGE)
                    this.runtime.omitEdge(value as EdgeInfo);
                else this.runtime.omitSubjectNode(value as Subject);
            }
        }

        return undefined;
    }
}