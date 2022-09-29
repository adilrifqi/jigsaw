import * as React from "react";
import * as ReactDOM from 'react-dom/client';
import { FlowComponent } from "./components/FlowComponent";

export function main() {
    ReactDOM.createRoot(document.getElementById("root")!).render(
        // TODO: Move the div to FlowComponent
        <div className="floatingedges" style={{width: "100%", height:"100vh"}}>
            <FlowComponent />
        </div>
    );
}