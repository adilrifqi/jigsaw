import * as React from "react";
import * as ReactDOM from 'react-dom/client';
import { FlowComponent } from "./components/FlowComponent";

export function main() {
    ReactDOM.createRoot(document.getElementById("root")!).render(
        <FlowComponent />
    );
}