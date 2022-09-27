import { main } from "./App";
import { DebugState } from "./model/DebugState";

addEventListener('load', main)

// Listen for "variables" command requests and associate seq with the ref argument
addEventListener('message', event => {
    const data = event.data;
    if (data["type"] == "request" && data["command"] == "variables") {
        const seq: number = data["seq"];
        const varsRef: number = data["arguments"]["variablesReference"];
        DebugState.getInstance().addSeq(seq, varsRef);
    }
})