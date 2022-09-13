import * as React from "react";
import { useCallback } from 'react';
import ReactFlow, { addEdge, useNodesState, useEdgesState, MiniMap, Controls, Background, Connection, Edge } from 'react-flow-renderer';

import initialNodes from './Nodes';
import initialEdges from './Edges';

export const FlowComponent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Edge<any> | Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  console.log("this is just a console log lmao")

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView>
        <MiniMap/>
        <Controls/>
        <Background/>
      </ReactFlow>
  );
}