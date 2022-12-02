import { CustSpecComponent } from "../CustSpecComponent";
import { Location } from "../location/Location";

export abstract class Command extends CustSpecComponent {
    protected readonly location: Location;

    constructor(location: Location) {
        super();
        this.location = location;
    }

    public abstract execute(): boolean;
}