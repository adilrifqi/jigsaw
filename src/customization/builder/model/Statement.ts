import { RuntimeError } from "../error/RuntimeError";
import { CustSpecComponent } from "./CustSpecComponent";
import { Location } from "./location/Location";

export abstract class Statement extends CustSpecComponent {
    protected parent?: Location;

    constructor(parent?: Location) {
        super();
        this.parent = parent;
    }

    public setParent(newParent?: Location) {
        this.parent = newParent;
    }
}