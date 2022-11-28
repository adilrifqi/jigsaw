import { Expr } from "./Expr"
import { ValueType } from "./ValueType";

export class StringExpr extends Expr {
    private readonly stringValue: string;

	constructor(stringValue: string) {
        super();
        this.stringValue = stringValue;
	}

    public type(): ValueType {
        return ValueType.STRING;
    }

    public value(): string {
        return this.stringValue;
    }
}