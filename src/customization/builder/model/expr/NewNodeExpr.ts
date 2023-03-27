import { NodeInfo } from "../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class NewNodeExpr extends Expr {
    private readonly nameExpr: Expr;
    private readonly runtime: CustomizationRuntime;

    constructor(expr: Expr, runtime: CustomizationRuntime) {
        super();
        this.nameExpr = expr;
        this.runtime = runtime;
    }
    
    public type(): ValueType {
        return ValueType.NODE;
    }

    public eval(): Object {
        const exprValue: Object = this.nameExpr.eval() as Object;
        if (exprValue instanceof RuntimeError) return exprValue;
        const name: string = exprValue as string;

        const result: NodeInfo =  {
            id: name,
            position: {x: 0, y:0},
            type: 'object',
            data: {
                title: name,
                rows: []
            }
        };

        this.runtime.addNode(result);
        return result;
    }
}