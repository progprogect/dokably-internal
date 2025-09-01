import { ContentBlock, EditorState } from 'draft-js';
import { EditorPlugin, PluginFunctions } from '@draft-js-plugins/editor';
import { KeyboardEvent } from 'react';
import {
  PluginBlockPropsToRender,
  PluginBlockToRender,
  PluginStore,
} from '../../types';
import { createEditorPluginStore } from '../../utils/createEditorPluginStore';
import { getBlockEntity } from '@app/hooks/editor/getBlockEntity';
import { TASK_BOARD_ENTITY } from './constants/task-board-entity-type';
import { getEntityType } from '@app/hooks/editor/getEntityType';

interface TaskBoardPluginStore extends PluginStore {
  showDeleteBoardConfirmation?: (
    editorState: EditorState,
    contentBlock: ContentBlock,
    pluginFunctions: PluginFunctions
  ) => void;
}

const TaskBoardPlugin = (
  BlockToRender: PluginBlockToRender<PluginBlockPropsToRender>,
): EditorPlugin => {
  const store = createEditorPluginStore<TaskBoardPluginStore>({
    getEditorState: undefined,
    setEditorState: undefined,
    showDeleteBoardConfirmation: undefined,
  });

  return {
    blockRendererFn: (
      block: ContentBlock,
      pluginFunctions: PluginFunctions,
    ) => {
      const blockType = block.getType();
      if (blockType !== 'atomic') return null;

      const contentState = pluginFunctions.getEditorState().getCurrentContent();
      const entity = getBlockEntity(TASK_BOARD_ENTITY, contentState, block);
      const type = getEntityType(contentState, entity[0]);
      if (type !== TASK_BOARD_ENTITY) return null;

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
    initialize: ({ getEditorState, setEditorState }: any) => {
      store.updateItem('getEditorState', getEditorState);
      store.updateItem('setEditorState', setEditorState);
    },
    // Add method to set the delete confirmation callback
    setDeleteBoardConfirmation: (callback: TaskBoardPluginStore['showDeleteBoardConfirmation']) => {
      store.updateItem('showDeleteBoardConfirmation', callback);
    },
    // Note: TaskBoard deletion handling is now done in DokablyEditor.component.tsx
    // to ensure it runs before the standard deletion logic
  } as any;
};

export default TaskBoardPlugin;
