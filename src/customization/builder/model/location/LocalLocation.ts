import { Command } from "../command/Command";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { Location, LocationType } from "./Location";

export class LocalLocation extends Location {
    constructor(name: string, runtime: CustomizationRuntime, parent?: Location, children?: Location[], commands?: Command[]) {
        super(name, runtime, parent, children, commands);
    }

    public type(): LocationType {
        return LocationType.LOCAL;
    }
}