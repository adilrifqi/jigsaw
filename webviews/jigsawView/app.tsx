import * as React from "react";
import * as ReactDOM from 'react-dom/client';
import { FlowComponent } from "./flow";

export function main() {
    ReactDOM.createRoot(document.getElementById("root")!).render(
        <div style={{width: "100%", height:"100vh"}}>
            <FlowComponent></FlowComponent>
        </div>
    );
}