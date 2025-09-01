export const moveUnit = <N extends { id: string }>(
  nodes: N[],
  active: N,
  over: N,
  delta: number,
): Array<{ id: string; order: number }> => {
  const newNodes = [...nodes];
  const activeIndex = newNodes.findIndex((node) => node.id === active.id);

  if (activeIndex !== -1) {
    newNodes.splice(activeIndex, 1);
  }

  const overIndex = newNodes.findIndex((node) => node.id === over.id);
  const insertIndex = delta < 0 ? overIndex : overIndex + 1;
  newNodes.splice(insertIndex, 0, active);

  return newNodes.map((node, index) => ({
    id: node.id,
    order: index,
  }));
};
