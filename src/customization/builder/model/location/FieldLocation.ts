import { CustomizationRuntime } from "../CustomizationRuntime";
import { Statement } from "../Statement";
import { Location, LocationType } from "./Location";

export class FieldLocation extends Location {
    constructor(name: string, runtime: CustomizationRuntime, parent?: Location, statements?: Statement[]) {
        super(name, runtime, parent, statements);
    }

    public type(): LocationType {
        return LocationType.FIELD;
    }
}