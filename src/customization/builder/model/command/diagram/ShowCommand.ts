import { ParserRuleContext } from "antlr4ts";
import { EdgeInfo, NodeInfo } from "../../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../../error/RuntimeError";
import { CustomizationRuntime } from "../../CustomizationRuntime";
import { ArrayType } from "../../expr/collection/ArrayExpr";
import { MapType } from "../../expr/collection/NewMapExpr";
import { Expr } from "../../expr/Expr";
import { ValueType } from "../../expr/ValueType";
import { Command } from "../language/Command";

export class ShowCommand extends Command {
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
                return new RuntimeError(this.ctx, "For some reason, the detected dimension for the add command is not 1, but is instead " + arrayType.dimension);
            else if (arrayType.type == ValueType.NODE)
                this.runtime.showNodes(value as NodeInfo[]);
            else this.runtime.showEdges(value as EdgeInfo[]);
        } else if (value !== null && value !== undefined) {
            if (this.expr.type() == ValueType.NODE)
                this.runtime.showNode(value as NodeInfo);
            else this.runtime.showEdge(value as EdgeInfo);
        }

        return undefined;
    }
}