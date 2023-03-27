import { RuntimeError } from "../../../error/RuntimeError";
import { CustomizationRuntime } from "../../CustomizationRuntime";
import { Command } from "../language/Command";

export class OmitAllCommand extends Command {
    private readonly runtime: CustomizationRuntime;

    constructor(runtime: CustomizationRuntime) {
        super();
        this.runtime = runtime;
    }

    public execute(): RuntimeError | undefined {
        this.runtime.omitAll();
        return undefined;
    }
}