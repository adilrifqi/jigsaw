import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Command } from "./Command";

export class ShowAllCommand extends Command {
    private readonly runtime: CustomizationRuntime;

    constructor(runtime: CustomizationRuntime) {
        super();
        this.runtime = runtime;
    }

    public execute(): RuntimeError | undefined {
        this.runtime.showAll();
        return undefined;
    }
}