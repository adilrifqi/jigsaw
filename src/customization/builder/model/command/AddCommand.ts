import { ParserRuleContext } from "antlr4ts";
import { EdgeInfo, NodeInfo } from "../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { ArrayType } from "../expr/ArrayExpr";
import { Expr } from "../expr/Expr";
import { ValueType } from "../expr/ValueType";
import { Location } from "../location/Location";
import { Command } from "./Command";

export class AddCommand extends Command {
    private readonly expr: Expr;
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;

    constructor(expr: Expr, runtime: CustomizationRuntime, ctx: ParserRuleContext, location?: Location) {
        super(location);
        this.expr = expr;
        this.runtime = runtime;
        this.ctx = ctx;
    }

    public execute(): RuntimeError | undefined {
        const value: Object | null = this.expr.eval();
        if (value instanceof RuntimeError) return value;
        const exprType: ValueType | ArrayType = this.expr.type();

        if (exprType as any in ValueType) {
            if (value !== null && value !== undefined) {
                if (this.expr.type() == ValueType.NODE)
                    this.runtime.addNode(value as NodeInfo);
                else this.runtime.addEdge(value as EdgeInfo);
            }
        } else {
            const arrayType: ArrayType = exprType as ArrayType;
            if (arrayType.dimension != 1)
                return new RuntimeError(this.ctx, "For some reason, the detected dimension for the add command is not 1, but is instead " + arrayType.dimension);
            else if (arrayType.type == ValueType.NODE)
                this.runtime.addNodes(value as NodeInfo[]);
            else this.runtime.addEdges(value as EdgeInfo[]);
        }

        return undefined;
    }
}