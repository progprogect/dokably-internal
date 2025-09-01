import { StyleProp, useEditor } from '@tldraw/editor';
import { useMemo } from 'react';

export function useStyleChangeCallback() {
  const editor = useEditor();

  return useMemo(() => {
    return function handleStyleChange<T>(
      style: StyleProp<T>,
      value: T,
      squashing: boolean
    ) {
      editor.batch(() => {
        if (editor.isIn('select')) {
          editor.setStyleForSelectedShapes(style, value, { squashing });
        }
        editor.setStyleForNextShapes(style, value, { squashing });
        editor.updateInstanceState({ isChangingStyle: true });
      });
    };
  }, [editor]);
}
