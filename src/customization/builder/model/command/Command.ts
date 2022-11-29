import { CustSpecComponent } from "../CustSpecComponent";

export abstract class Command extends CustSpecComponent {
    public abstract execute(): void;
}