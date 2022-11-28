import { Expr } from "./Expr"
import { ValueType } from "./ValueType";

export class CharExpr extends Expr {
    private readonly charValue: string;

	constructor(charValue: string) {
        super();
        this.charValue = charValue;
	}

    public type(): ValueType {
        return ValueType.CHAR;
    }

    public value(): string {
        return this.charValue;
    }
}