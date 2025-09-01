import { EditorRef } from '@draft-js-plugins/editor';
import { Store } from '@draft-js-plugins/utils';
import {
  ContentBlock,
  ContentState,
  EditorState,
  SelectionState,
} from 'draft-js';
import { FunctionComponent } from 'react';

export interface PluginStore {
  setEditorState?(editorState: EditorState): void;
  getEditorState?(): EditorState;
  getEditorRef?(): EditorRef;
}

export type PluginBlockPropsToRender = { store: Store<PluginStore> };

export type PluginProps<
  BlockProps extends PluginBlockPropsToRender = PluginBlockPropsToRender,
> = {
  block: ContentBlock;
  offsetKey: string;
  selection: SelectionState;
  contentState: ContentState;
  blockProps: BlockProps;
  className?: string;
};

export type WrappedComponentProps<
  BlockProps extends PluginBlockPropsToRender = PluginBlockPropsToRender,
> = PluginProps<BlockProps> & {
  className?: string;
};

export type PluginBlockToRender<
  BlockProps extends PluginBlockPropsToRender = PluginBlockPropsToRender,
> = FunctionComponent<WrappedComponentProps<BlockProps>>;
