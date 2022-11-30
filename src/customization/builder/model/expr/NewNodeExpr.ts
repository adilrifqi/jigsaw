import { Node } from "../Node";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class NewNodeExpr extends Expr {
    private readonly nodeValue: Node;

    constructor(nodeValue: Node) {
        super();
        this.nodeValue = nodeValue;
    }
    
    public type(): ValueType {
        return ValueType.NODE;
    }

    public value(): Node {
        return this.nodeValue;
    }

    public initialize(): void {
        this.nodeValue.initialize();
    }
}