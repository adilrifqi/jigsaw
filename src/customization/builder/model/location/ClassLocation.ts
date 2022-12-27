import { Location, LocationType } from "./Location";

export class ClassLocation extends Location {
    public type(): LocationType {
        return LocationType.CLASS;
    }
}