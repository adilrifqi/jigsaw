import { Location, LocationType } from "./Location";
import { MethodLocation } from "./MethodLocation";

export class ClassLocation extends Location {
    public type(): LocationType {
        return LocationType.CLASS;
    }

    public getMethodLocations(): MethodLocation[] {
        const result: MethodLocation[] = [];
        for (const statement of this.statements)
            if (statement instanceof MethodLocation)
                result.push(statement);
        return result;
    }
}