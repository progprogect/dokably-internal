import { TLGroupShape, TLShape, useEditor, useValue } from '@tldraw/editor';
import { useMemo } from 'react';

export const useSelectedShapes = () => {
  const editor = useEditor();

  const selectedShapes = useValue(
    'selectedShapes',
    () => editor.getSelectedShapes(),
    [editor]
  );

  const shapes = useMemo(() => {
    const isGroup = editor.isShapeOfType<TLGroupShape>(
      selectedShapes[0],
      'group'
    );

    if (!isGroup) return selectedShapes || [];

    const groupChildrenIds = editor.getSortedChildIdsForParent(
      selectedShapes[0]
    );

    const groupChildren = groupChildrenIds.map((id) =>
      editor.getShape(id)
    ) as TLShape[];

    return groupChildren || [];
  }, [editor, selectedShapes]);

  return shapes;
};
