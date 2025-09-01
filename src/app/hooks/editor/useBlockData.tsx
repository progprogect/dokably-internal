import { ContentBlock, ContentState, EditorState, Modifier, SelectionState } from 'draft-js';

const useBlockData = () => {
  const decreaseBlockDepth = (editorState: EditorState, block: ContentBlock): EditorState => {
    const blockKey = block.getKey();
    const depth = block.getDepth();
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const newContentState = contentState.merge({
      selectionBefore: selection,
      selectionAfter: selection,
      blockMap: contentState.getBlockMap().update(blockKey, (block) => block.set('depth', depth - 1) as ContentBlock),
    }) as ContentState;
    const newEditorState = EditorState.push(editorState, newContentState, 'adjust-depth');
    return newEditorState;
  };

  const riseBlockDepth = (editorState: EditorState, block: ContentBlock): EditorState => {
    const blockKey = block.getKey();
    const depth = block.getDepth();
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const newContentState = contentState.merge({
      selectionBefore: selection,
      selectionAfter: selection,
      blockMap: contentState.getBlockMap().update(blockKey, (block) => block.set('depth', depth + 1) as ContentBlock),
    }) as ContentState;
    const newEditorstate = EditorState.push(editorState, newContentState, 'adjust-depth');
    return newEditorstate;
  };

  const setBlockDepth = (editorState: EditorState, key: string, depth: number): EditorState => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const newContentState = contentState.merge({
      selectionBefore: selection,
      selectionAfter: selection,
      blockMap: contentState.getBlockMap().update(key, (block) => block.set('depth', depth) as ContentBlock),
    }) as ContentState;
    const newEditorstate = EditorState.push(editorState, newContentState, 'adjust-depth');
    return newEditorstate;
  };

  const setBlockDataValue = (
    editorState: EditorState,
    block: ContentBlock,
    key: string,
    value: any,
    isSaveSelection = true,
    shouldTrackHistory = true,
  ): EditorState => {
    const userSelection = editorState.getSelection();
    let newData = block.getData();
    newData = newData.set(key, value);
    const selection = SelectionState.createEmpty(block.getKey());
    const newContent = Modifier.setBlockData(editorState.getCurrentContent(), selection, newData);
    const newEditor = shouldTrackHistory
      ? EditorState.push(editorState, newContent, 'change-block-data')
      : EditorState.set(editorState, { currentContent: newContent });

    const finalEditorState = isSaveSelection ? EditorState.forceSelection(newEditor, userSelection) : newEditor;
    return finalEditorState;
  };

  const setBlockDataValues = (
    editorState: EditorState,
    block: ContentBlock,
    entities: Record<string, any>[],
  ): EditorState => {
    const userSelection = editorState.getSelection();
    let newData = block.getData();
    entities.forEach((item) => {
      newData = newData.set(item.key, item.value);
    });
    const selection = SelectionState.createEmpty(block.getKey());
    const newContent = Modifier.setBlockData(editorState.getCurrentContent(), selection, newData);
    const newEditor = EditorState.push(editorState, newContent, 'change-block-data');

    return EditorState.forceSelection(newEditor, userSelection);
  };

  return {
    decreaseBlockDepth,
    riseBlockDepth,
    setBlockDepth,
    setBlockDataValue,
    setBlockDataValues,
  };
};

export default useBlockData;
