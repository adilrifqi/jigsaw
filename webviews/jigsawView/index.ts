import { main } from "./App";
import { DebugState } from "./DebugState";

addEventListener('load', main)

addEventListener('message', event => {
    console.log(event.data);
    DebugState.debugging = true;
    main();
})