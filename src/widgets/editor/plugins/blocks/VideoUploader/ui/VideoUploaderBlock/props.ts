import {
  PluginBlockPropsToRender,
  PluginProps,
} from '@widgets/editor/plugins/types';
import { ContentBlock, EditorState } from 'draft-js';

export type VideoUploaderBlockProps = {
  block: ContentBlock;
  editorState: EditorState;
  setEditorState: (editorState: EditorState) => EditorState;
};

export type BlockProps = PluginProps<
  VideoUploaderBlockProps & PluginBlockPropsToRender
> & { readonly?: boolean };
