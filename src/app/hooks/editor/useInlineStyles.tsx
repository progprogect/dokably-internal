import { EditorState, Modifier, RichUtils } from 'draft-js';

import { toolbarStyleMap } from '../../constants/Editor.styles';

const useInlineStyles = () => {
  const toggleInlineStyle = (
    editorState: EditorState,
    style: string,
    event?: React.MouseEvent
  ): EditorState => {
    event?.preventDefault();
    return RichUtils.toggleInlineStyle(editorState, style);
  };

  const removeAllInlineStyles = (
    editorState: EditorState,
    key?: string
  ): EditorState => {
    const block = editorState
      .getCurrentContent()
      .getBlockForKey(key || editorState.getSelection().getAnchorKey());
    let selection = editorState.getSelection();
    const savedSelection = selection;
    editorState = EditorState.forceSelection(
      editorState,
      selection.merge({
        focusKey: block.getKey(),
        anchorKey: block.getKey(),
        anchorOffset: 0,
        focusOffset: block.getText().length,
      })
    );
    const nextContentState = Object.keys(toolbarStyleMap).reduce(
      (contentState, style) => {
        return Modifier.removeInlineStyle(
          contentState,
          editorState.getSelection(),
          style
        );
      },
      editorState.getCurrentContent()
    );

    editorState = EditorState.push(
      editorState,
      nextContentState,
      'change-inline-style'
    );

    editorState = EditorState.forceSelection(editorState, savedSelection);

    return editorState;
  };

  const removeStylesInNewLine = (editorState: EditorState) => {
    Object.keys(toolbarStyleMap).map(style => {
      if (editorState.getCurrentInlineStyle().has(style)) {
        editorState = RichUtils.toggleInlineStyle(editorState, style);
      }
    })
    return editorState;
  };

  return { toggleInlineStyle, removeAllInlineStyles, removeStylesInNewLine };
};

export default useInlineStyles;
