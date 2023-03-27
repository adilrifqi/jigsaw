import { MethodSignature } from "../../../../debugmodel/StackFrame";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Statement } from "../Statement";
import { Location, LocationType } from "./Location";

export class MethodLocation extends Location {
    public readonly signature: MethodSignature;

    constructor(signature: MethodSignature, runtime: CustomizationRuntime, parent?: Location, statements?: Statement[]) {
        super(signature.toString(), runtime, parent, statements);
        this.signature = signature;
    }

    public type(): LocationType {
        return LocationType.METHOD;
    }
}