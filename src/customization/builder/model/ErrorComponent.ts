import { TypeErrorBuilder } from "../error/TypeErrorBuilder";
import { CustSpecComponent } from "./CustSpecComponent";

export class ErrorComponent extends CustSpecComponent {
    private readonly message: string;

    constructor(message: string) {
        super();
        this.message = message;
    }

    public getMessage(): string {
        return this.message;
    }
}