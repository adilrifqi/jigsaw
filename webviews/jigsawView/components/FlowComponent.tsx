import React = require("react");
import ReactFlow, {
    Background,
    Controls,
    Edge,
    MarkerType,
    Node,
    useEdgesState,
    useNodesState,
} from "react-flow-renderer";
import FloatingEdge from './FloatingEdge';
import ObjectNode from "./ObjectNode";
import "./styles.css";
import { layoutDiagram } from "./utils";

// #region Custom Node Declaration
type NodeData = {
    data: object,
    isConnectable: boolean,
    targetPosition: string,
    sourcePosition: string
}
type ObjectNode = Node<NodeData>;
const nodeTypes = {
    object: ObjectNode,
}
// #endregion Custom Node Declaration

// #region Custom Edge Declaration
type EdgeData = {
    id: string;
    source: string;
    target: string;
    label: string;
    type: string;
    markerEnd: MarkerType;
};
type FloatingEdge = Edge<EdgeData>;
const edgeTypes = {
    floating: FloatingEdge,
};
// #endregion Custom Edge Declaration

// Global data
var data: any = {};

export function FlowComponent() {
    // Hooks
    const flowRef = React.useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // #region eventListener
    // Listen for DAP messages sent from the extension
    window.addEventListener('message', event => {
        const contents = event.data;

        var update: boolean = false;

        if (contents["command"] == "data") {
            data = contents["body"];
            for (var edge of data["edges"]) {
                edge["markerEnd"] = { type: MarkerType.ArrowClosed, width: 20, height: 20 };
            }
            update = true;
        }

        if (update) {
            // Update the node and edge states
            setNodes(data["nodes"]);
            setEdges(data["edges"]);
        }
    })
    // #endregion eventListener

    // return <h1>Hello</h1>;

    React.useLayoutEffect(() => {
        var active: boolean = true;
        var update: boolean = false;
        const nodesCopy: any[] = [];
        for (var node of nodes) {
            nodesCopy.push(node);
            update = update || !node.data["layedOut"];
        }

        if (flowRef.current) {
            // Gets the div encompassing all the nodes' divs
            const htmlNodes: HTMLCollection | undefined =
                flowRef.current.firstElementChild?.firstElementChild?.firstElementChild?.lastElementChild?.children;

            if (htmlNodes) {
                for (var htmlNode of Array.from(htmlNodes)) {
                    const divHtmlNode: HTMLDivElement = htmlNode as HTMLDivElement;
                    const htmlNodeID: string | null = htmlNode.getAttribute("data-id");
                    const htmlNodeWidth: number = divHtmlNode.offsetWidth;
                    const htmlNodeHeight: number = divHtmlNode.offsetHeight;

                    const flowNode: any = nodesCopy.find(node => node.id == htmlNodeID)
                    if (htmlNodeID && flowNode) {
                        const flowNodeWidth = flowNode["width"];
                        const flowNodeHeight = flowNode["height"];
                        const flowNodeHasWidth: boolean = flowNodeWidth != undefined && flowNodeWidth != null;
                        const flowNodeHasHeight: boolean = flowNodeHeight != undefined && flowNodeHeight != null;
                        if (flowNodeHasWidth && flowNodeHasHeight) {
                            if (flowNodeWidth != htmlNodeWidth || flowNodeHeight != htmlNodeHeight) {
                                update = true;
                            }
                        } else {
                            update = true;
                        }

                        flowNode["width"] = htmlNodeWidth;
                        flowNode["height"] = htmlNodeHeight;
                    }
                }
            }
        }

        if (update) {
            layoutDiagram(nodesCopy, edges).then((nodePositions: Map<string, {x: number, y: number}>) => {
                for (var nodeCopy of nodesCopy) {
                    const nodePosition: {x: number, y:number} | undefined = nodePositions.get(nodeCopy["id"]);
                    if (nodePosition) nodeCopy["position"] = {x: nodePosition.x, y: nodePosition.y};
                    nodeCopy["data"]["layedOut"] = true;
                }
                if (!active) return;
                setNodes(nodesCopy);
            });
        }

        return () => {
            active = false;
        };
    });

    return (
        <div ref={flowRef} className="floatingedges" style={{width: "100%", height:"100vh"}}>
            <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
              fitView>
                <Controls/>
                {/* <Background/> */}
              </ReactFlow>
        </div>
    );
}