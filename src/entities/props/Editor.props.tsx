import { EditorState } from 'draft-js';

export interface EditorProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
}
