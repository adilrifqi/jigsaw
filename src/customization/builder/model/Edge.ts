import { Node } from "./Node";

export class Edge {
    private origin: Node;
    private target: Node;

    constructor(origin: Node, target: Node) {
        this.origin = origin;
        this.target = target;
    }

	public get $origin(): Node {
		return this.origin;
	}

	public get $target(): Node {
		return this.target;
	}

	public set $origin(value: Node) {
		this.origin = value;
	}

	public set $target(value: Node) {
		this.target = value;
	}
}