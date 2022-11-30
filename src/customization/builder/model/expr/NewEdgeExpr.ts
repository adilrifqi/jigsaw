import { Edge } from "../Edge";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class NewEdgeExpr extends Expr {
    private readonly edgeValue: Edge;

    constructor(edgeValue: Edge) {
        super();
        this.edgeValue = edgeValue;
    }
    
    public type(): ValueType {
        return ValueType.EDGE;
    }

    public value(): Edge {
        return this.edgeValue;
    }

    public initialize(): void {
        this.edgeValue.initialize();
    }
}