import { Command } from "../command/Command";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Location, LocationType } from "./Location";

export class MethodLocation extends Location {
    private readonly paramTypes: string[];

    constructor(name: string, runtime: CustomizationRuntime, parent: Location, paramTypes: string[], children?: Location[], commands?: Command[]) {
        super(name, runtime, parent, children, commands);
        this.paramTypes = paramTypes;
    }

    public type(): LocationType {
        return LocationType.METHOD;
    }
}