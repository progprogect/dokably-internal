import { ContentBlock, EditorState, Modifier, RichUtils } from 'draft-js';

import BlockType from '@entities/enums/BlockType';
import { getNestedBlocks } from '@app/services/block.service';
import { toolbarStyleMap } from '../../constants/Editor.styles';
import useBlockData from './useBlockData';
import useContentBlock from './useContentBlock';

const useBlockTypes = () => {
  const { getCurrentContentBlock } = useContentBlock();
  const { setBlockDataValues, setBlockDepth, setBlockDataValue } =
    useBlockData();

  const toggleBlockType = (
    editorState: EditorState,
    blockType: string,
    contentBlock?: ContentBlock,
  ): EditorState => {
    const currentContentBlock =
      contentBlock ?? getCurrentContentBlock(editorState);
    const depth = currentContentBlock.getDepth();

    let newEditorState = setBlockDataValues(editorState, currentContentBlock, [
      { key: 'isShow', value: true },
      { key: 'state', value: false },
      { key: 'url', value: '' },
      { key: 'isDisable', value: false },
    ]);

    if (currentContentBlock.getType() === BlockType.Toggle) {
      let nestedBlocks = getNestedBlocks(
        currentContentBlock,
        editorState.getCurrentContent().getBlocksAsArray()
      );
      nestedBlocks.forEach((nestedBlock) => {
        newEditorState = setBlockDataValue(
          newEditorState,
          nestedBlock,
          'isShow',
          true
        );
      });
    }

    editorState = RichUtils.toggleBlockType(newEditorState, blockType);
    editorState = setBlockDepth(editorState, currentContentBlock.getKey(), depth);
    return editorState;
  };

  const resetBlock = (
    editorState: EditorState,
    blockType?: BlockType | string
  ): EditorState => {
    const selection = editorState.getSelection();
    const nextContentState = Object.keys(toolbarStyleMap).reduce(
      (contentState, style) => {
        return Modifier.removeInlineStyle(contentState, selection, style);
      },
      editorState.getCurrentContent()
    );

    const contentBlock = getCurrentContentBlock(editorState);
    const depth = contentBlock.getDepth();
    let newEditorState = setBlockDataValues(editorState, contentBlock, [
      { key: 'isShow', value: true },
      { key: 'state', value: false },
      { key: 'url', value: '' },
      { key: 'isDisable', value: false },
    ]);
    let nextEditorState = EditorState.push(
      newEditorState,
      nextContentState,
      'change-inline-style'
    );
    newEditorState = RichUtils.toggleBlockType(
      nextEditorState,
      blockType ?? BlockType.Text
    );
    return setBlockDepth(newEditorState, contentBlock.getKey(), depth);
  };

  const addEmbedBlock = (
    editorState: EditorState,
    blockType: string,
    name: string,
    url: string
  ): EditorState => {
    const currentContentBlock = getCurrentContentBlock(editorState);
    const depth = currentContentBlock.getDepth();

    let newEditorState = setBlockDataValues(editorState, currentContentBlock, [
      { key: 'isShow', value: true },
      { key: 'state', value: true },
      { key: 'isDisable', value: false },
      { key: 'url', value: url },
      { key: 'name', value: name },
    ]);

    if (currentContentBlock.getType() === BlockType.Toggle) {
      let nestedBlocks = getNestedBlocks(
        currentContentBlock,
        editorState.getCurrentContent().getBlocksAsArray()
      );
      nestedBlocks.forEach((nestedBlock) => {
        newEditorState = setBlockDataValue(
          newEditorState,
          nestedBlock,
          'isShow',
          true
        );
      });
    }

    editorState = RichUtils.toggleBlockType(newEditorState, blockType);
    editorState = setBlockDepth(editorState, currentContentBlock.getKey(), depth);
    return editorState;
  };

  return { toggleBlockType, resetBlock, addEmbedBlock };
};

export default useBlockTypes;
