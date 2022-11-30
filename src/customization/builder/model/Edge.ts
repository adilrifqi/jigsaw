import { Expr } from "./expr/Expr";
import { Node } from "./Node";

export class Edge {
	private readonly originExpr: Expr;
	private readonly targetExpr: Expr;
	
    private origin: Node | undefined = undefined;
    private target: Node | undefined = undefined;

	private initialized: boolean = false;

	constructor(originExpr: Expr, targetExpr: Expr) {
		this.originExpr = originExpr;
		this.targetExpr = targetExpr;
	}

	public getOrigin(): Node | undefined {
		return this.origin;
	}

	public getTarget(): Node | undefined {
		return this.target;
	}

	public setOrigin(value: Node) {
		this.origin = value;
	}

	public setTarget(value: Node) {
		this.target = value;
	}

	public initialize() {
		if (!this.initialized) {
			this.origin = this.originExpr.value() as Node;
			this.target = this.targetExpr.value() as Node;
			this.initialized = true;
		}
	}
}