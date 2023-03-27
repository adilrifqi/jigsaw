import { RuntimeError } from "../../../error/RuntimeError";
import { Statement } from "../../Statement";

export abstract class Command extends Statement {
    constructor() {
        super(undefined);
    }

    public abstract execute(): RuntimeError | undefined;
}