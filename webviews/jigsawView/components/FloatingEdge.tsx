import { useCallback } from 'react';
import React = require('react');
import { useStore, getBezierPath, MarkerType, EdgeText, getBezierEdgeCenter } from 'react-flow-renderer';

import { getEdgeParams } from './utils';

function FloatingEdge(
  { id, source, target, label, markerEnd}:
  {id:string, source:string, target:string, label:string, markerEnd:MarkerType}
  ) {
  const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
  const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

  const d = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  const [labelX, labelY, offsetX, offsetY] = getBezierEdgeCenter({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetX: tx,
    targetY: ty,
    targetPosition: targetPos,
  });

  return (
    <>
      <path id={id} className="react-flow__edge-path" d={d} markerEnd={markerEnd}
      style={{strokeWidth:2}}
      />
      <EdgeText
      x={labelX}
      y={labelY}
      label={label}
    />
    </>
  );
}

export default FloatingEdge;
