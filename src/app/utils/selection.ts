export const getCurrentSelection = () => window.getSelection();

export const getCurrentRange = () => {
  const selection = getCurrentSelection();
  return selection?.getRangeAt?.(0);
};

export const getActiveClassName = () => {
  const range = getCurrentRange();
  const startClassList = new Set<string>(
    Array.from(range?.startContainer.parentElement?.classList || [])
  );

  if (
    (range?.commonAncestorContainer as HTMLElement)?.id === 'editor-content'
  ) {
    range?.commonAncestorContainer.childNodes.forEach((block) => {
      block.childNodes.forEach((node) => {
        if (range?.intersectsNode(node)) {
          const currentClassList = new Set(
            Array.from((node as HTMLElement)?.classList || [])
          );

          startClassList.forEach((className) => {
            if (!currentClassList.has(className)) {
              startClassList.delete(className);
            }
          });
        }
      });
    });
  } else {
    let currentNode = range?.startContainer.parentElement;

    while (currentNode && range?.intersectsNode(currentNode)) {
      const currentClassList = new Set(
        Array.from(currentNode?.classList || [])
      );

      startClassList.forEach((className) => {
        if (!currentClassList.has(className)) {
          startClassList.delete(className);
        }
      });

      currentNode = currentNode.nextSibling as HTMLElement;
    }
  }

  let activeClassName = '';

  const values = startClassList.entries();

  for (const value of values) {
    activeClassName += value[0] + ' ';
  }

  return activeClassName;
};
