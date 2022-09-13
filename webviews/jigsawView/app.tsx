import * as React from "react";
import * as ReactDOM from 'react-dom/client';
import { DebugState } from "./DebugState";
import { FlowComponent } from "./Flow";

export function main() {
    if (DebugState.debugging) {
        ReactDOM.createRoot(document.getElementById("root")!).render(
            <div style={{width: "100%", height:"100vh"}}>
                <FlowComponent></FlowComponent>
            </div>
        );
    }
    
}