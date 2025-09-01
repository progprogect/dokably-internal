import { ContentBlock, EditorState } from 'draft-js';
import { EditorPlugin, PluginFunctions } from '@draft-js-plugins/editor';
import { KeyboardEvent } from 'react';

import { getEntityType } from '../utils/getEntityType';
import { VIDEO_ENTITY_TYPE } from '../constants/video-entity-type';
import { getVideoEntity } from '../utils/getVideoEntity';
import { removeAtomicBlock } from '../utils/removeAtomicBlock';
import {
  PluginStore,
  PluginBlockPropsToRender,
  PluginBlockToRender,
} from '@widgets/editor/plugins/types';
import { createEditorPluginStore } from '@widgets/editor/plugins/utils/createEditorPluginStore';

const createVideoUploaderPlugin = <P extends PluginBlockPropsToRender>(
  BlockToRender: PluginBlockToRender<P>,
): EditorPlugin => {
  const store = createEditorPluginStore<PluginStore>({
    getEditorState: undefined,
    setEditorState: undefined,
  });

  return {
    blockRendererFn: (
      block: ContentBlock,
      pluginFunctions: PluginFunctions,
    ) => {
      const blockType = block.getType();
      if (blockType !== 'atomic') return null;

      const contentState = pluginFunctions.getEditorState().getCurrentContent();
      const entity = getVideoEntity(contentState, block);
      const type = getEntityType(contentState, entity[0]);
      if (type !== VIDEO_ENTITY_TYPE) return null;

      return {
        component: BlockToRender,
        props: {
          store,
          block,
          readonly: pluginFunctions.getReadOnly(),
          editorState: pluginFunctions.getEditorState(),
          setEditorState: (editorState: EditorState) =>
            pluginFunctions.setEditorState(editorState),
        },
      };
    },
    initialize: ({ getEditorState, setEditorState }) => {
      store.updateItem('getEditorState', getEditorState);
      store.updateItem('setEditorState', setEditorState);
    },
    keyBindingFn: (event: KeyboardEvent, pluginFunctions: PluginFunctions) => {
      const editorState = pluginFunctions.getEditorState();
      const selectionState = editorState.getSelection();
      const anchorKey = selectionState.getAnchorKey();
      const currentContent = editorState.getCurrentContent();
      const contentBlock = currentContent.getBlockForKey(anchorKey);

      if (contentBlock.getType() === 'atomic' && event.key === 'Backspace') {
        // Check if this is actually a video entity, not just any atomic block
        const entity = getVideoEntity(currentContent, contentBlock);
        const type = getEntityType(currentContent, entity[0]);
        
        if (type === VIDEO_ENTITY_TYPE) {
          // Only handle video entities, not other atomic blocks like TaskBoard
          pluginFunctions.setEditorState(
            removeAtomicBlock(editorState, currentContent, contentBlock),
          );
          return 'handled';
        }
      }
    },
  };
};

export default createVideoUploaderPlugin;
