import {
  ContentBlock,
  ContentState,
  DraftBlockType,
  EditorState,
  RawDraftEntityRange,
  RawDraftInlineStyleRange,
  genKey,
} from 'draft-js';

import BlockType from '@entities/enums/BlockType';

interface IBlockParams {
  key?: string;
  type?: DraftBlockType;
  text?: string;
  depth?: number;
  inlineStyleRanges?: Array<RawDraftInlineStyleRange>;
  entityRanges?: Array<RawDraftEntityRange>;
}

const useEditorState = () => {
  const insertEmptyBlockAfter = (
    editorState: EditorState,
    key: string,
    blockParams?: IBlockParams
  ): EditorState => {
    const newBlock = new ContentBlock({
      key: blockParams?.key ?? genKey(),
      type: blockParams?.type ?? BlockType.Text,
      text: blockParams?.text ?? '',
      depth: blockParams?.depth ?? 0,
      inlineStyleRanges: blockParams?.inlineStyleRanges ?? [],
      entityRanges: blockParams?.entityRanges ?? [],
    });
    const currentBlock = editorState
      .getCurrentContent()
      .getBlockMap()
      .find((_value, _key) => _key === key);
    const activeBlockIndex = editorState
      .getCurrentContent()
      .getBlocksAsArray()
      .findIndex((el: ContentBlock) => el.getKey() === currentBlock.getKey());
    let selectionState = editorState.getSelection();
    let newSelection = selectionState.merge({
      focusKey: newBlock.getKey(),
      anchorKey: newBlock.getKey(),
      focusOffset: 0,
      anchorOffset: 0,
    });
    const contentState = editorState.getCurrentContent();
    const blockMap = contentState.getBlockMap();
    const blocksBefore = blockMap.toSeq().slice(0, activeBlockIndex + 1);
    const blocksAfter = blockMap.slice(activeBlockIndex + 1);
    let newBlocks = [
      [newBlock.getKey(), newBlock],
      [currentBlock.getKey(), currentBlock],
    ];
    const newBlockMap = blocksBefore
      .concat(newBlocks, blocksAfter)
      .toOrderedMap();

    editorState = EditorState.push(
      editorState,
      ContentState.createFromBlockArray(newBlockMap.toArray()),
      'insert-fragment'
    );
    editorState = EditorState.forceSelection(editorState, newSelection);
    return editorState;
  };

  return { insertEmptyBlockAfter };
};

export default useEditorState;
