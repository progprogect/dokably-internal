import { EditorState } from 'draft-js';
import { Dispatch, SetStateAction } from 'react';

export interface IDokablyEditor {
  editorState: EditorState;
  setEditorState: Dispatch<SetStateAction<EditorState>>;
  isInit: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  mode?: 'default' | 'task';
}
