import { main } from "./App";
import { DebugState } from "./model/DebugState";

addEventListener('load', main)

// Listen for "variables" command requests and associate seq with the ref argument
addEventListener('message', event => {
    const data = event.data;

    // Store the sequence number of the command to associate the response with the frame (for multiple ifs)
    if (data["type"] == "request" && data["command"] == "scopes") {
        const seq: number = data["seq"];
        const frameId: number = data["arguments"]["frameId"];
        DebugState.getInstance().setScopesSeqToFrameId(seq, frameId);
    }
    if (data["type"] == "request" && data["command"] == "variables") {
        const variablesReference: number = data["arguments"]["variablesReference"];
        const seq: number = data["seq"];
        DebugState.getInstance().setVariablesSeqToFrameId(seq, variablesReference);
    }
})