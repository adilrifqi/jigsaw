import { Expr } from "../Expr"
import { ValueType } from "../ValueType";

export class StringLitExpr extends Expr {
    private readonly stringValue: string;

	constructor(stringValue: string) {
        super();
        this.stringValue = stringValue;
	}

    public type(): ValueType {
        return ValueType.STRING;
    }

    public eval(): string {
        return this.stringValue;
    }
}