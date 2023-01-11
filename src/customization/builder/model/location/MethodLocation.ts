import { JigsawVariable } from "../../../../debugmodel/JigsawVariable";
import { MethodSignature } from "../../../../debugmodel/StackFrame";
import { RuntimeError } from "../../error/RuntimeError";
import { Command } from "../command/Command";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { ClassLocation } from "./ClassLocation";
import { Location, LocationType } from "./Location";

export class MethodLocation extends Location {
    public readonly signature: MethodSignature;

    constructor(signature: MethodSignature, runtime: CustomizationRuntime, parent?: Location, children?: Location[], commands?: Command[]) {
        super(signature.toString(), runtime, parent, children, commands);
        this.signature = signature;
    }

    public type(): LocationType {
        return LocationType.METHOD;
    }
}