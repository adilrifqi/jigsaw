import { Expr } from "./expr/Expr";

export class Node {
    private name: string = "NODE";
    private initialized: boolean = false;
    private nameExpr: Expr;

    constructor(nameExpr: Expr) {
        this.nameExpr = nameExpr;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string) {
        this.name = name;
    }

    public initialize() {
        if (!this.initialized) {
            this.name = this.nameExpr.value() as string;
            this.initialized = true;
        }
    }
}