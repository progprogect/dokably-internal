import { ContentBlock, ContentState, EditorState } from 'draft-js';
import { getBlockEntity } from './getBlockEntity';
import { getBlockEntityData } from './getBlockEntityData';
import { removeAtomicBlock } from './removeAtomicBlock';
import { useCallback } from 'react';
import { setEntityData } from '@widgets/editor/plugins/utils/setEntityData';

export function useAtomicBlock<Metadata extends object>({
  entityType,
  contentState,
  editorState,
  block,
  setEditorState,
}: {
  entityType: string;
  block: ContentBlock;
  contentState: ContentState;
  editorState: EditorState;
  setEditorState: (editorState: EditorState) => EditorState;
}) {
  const removeBlock = useCallback(() => {
    setEditorState(removeAtomicBlock(editorState, contentState, block));
  }, [block, contentState, editorState, setEditorState]);

  const setBlockEntityData = useCallback(
    (metadata: Metadata | null) => {
      const [entityKey] = getBlockEntity(entityType, contentState, block);
      if (!entityKey) return;
      const newEditorState = setEntityData(editorState, entityKey, {
        metadata,
      });

      setEditorState(newEditorState);
    },
    [block, contentState, editorState, entityType, setEditorState],
  );

  const removeEntityData = useCallback(() => {
    setBlockEntityData(null);
  }, [setBlockEntityData]);

  const getEntityData = useCallback(() => {
    const [entityKey] = getBlockEntity(entityType, contentState, block);
    return getBlockEntityData<Metadata>(contentState, entityKey);
  }, [block, contentState, entityType]);

  return {
    removeBlock,
    removeEntityData,
    setEntityData: setBlockEntityData,
    getEntityData: getEntityData,
  };
}
