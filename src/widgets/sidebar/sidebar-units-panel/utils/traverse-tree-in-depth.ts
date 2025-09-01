export const traverseTreeInDepth = function traverse<
  Node extends { children: Node[] },
>(
  tree: Node[],
  callback: (node: Node, stackTrace: Node[], breakLoop: () => void) => void,
  _stackTrace: Node[] = [],
) {
  let interrupted = false;
  const breakLoop = () => {
    interrupted = true;
  };

  for (const node of tree) {
    if (interrupted) break;
    const currentStack = [..._stackTrace, node];
    callback(node, currentStack, breakLoop);
    if (node.children) {
      traverse(node.children, callback, currentStack);
    }
  }
};
