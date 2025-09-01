import {
  PluginBlockPropsToRender,
  PluginProps,
} from '@widgets/editor/plugins/types';
import { ContentBlock, EditorState } from 'draft-js';

export type FileUploaderBlockProps = {
  block: ContentBlock;
  editorState: EditorState;
  setEditorState: (editorState: EditorState) => EditorState;
};

export type BlockProps = PluginProps<
  FileUploaderBlockProps & PluginBlockPropsToRender
> & { readonly?: boolean };
