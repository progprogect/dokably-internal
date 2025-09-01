import { ContentBlock, EditorState } from 'draft-js';

import BlockType from '@entities/enums/BlockType';
import { EMBEDS_BLOCK_TYPES } from '@app/constants/embeds';

const useContentBlock = () => {
  const getCurrentContentBlock = (editorState: EditorState): ContentBlock => {
    let selectionState = editorState.getSelection();
    let anchorKey = selectionState.getAnchorKey();
    let currentContent = editorState.getCurrentContent();
    let currentContentBlock = currentContent.getBlockForKey(anchorKey);

    return currentContentBlock;
  };

  const getPrevBlock = (editorState: EditorState): ContentBlock => {
    const contentBlock = getCurrentContentBlock(editorState);
    const activeBlockIndex = editorState
      .getCurrentContent()
      .getBlocksAsArray()
      .findIndex((el: ContentBlock) => el.getKey() === contentBlock.getKey());
    const prevBlock = editorState.getCurrentContent().getBlocksAsArray()[
      activeBlockIndex - 1
    ];
    return prevBlock;
  };

  const getVisiblePrevBlock = (
    editorState: EditorState,
    key: string
  ): ContentBlock => {
    const content = editorState.getCurrentContent();
    let keyBefore = content.getKeyBefore(key);
    if (!keyBefore) {
      keyBefore = key;
    } else {
      while (
        content.getBlockForKey(keyBefore).getData().get('isShow') === false ||
        EMBEDS_BLOCK_TYPES.includes(
          content.getBlockForKey(keyBefore).getType() as BlockType
        )
      ) {
        keyBefore = content.getKeyBefore(keyBefore);
      }
    }

    return content.getBlockForKey(keyBefore);
  };

  const getVisibleNextBlock = (
    EditorState: EditorState,
    key: string
  ): ContentBlock => {
    const content = EditorState.getCurrentContent();
    let keyAfter = content.getKeyAfter(key);
    if (!keyAfter) {
      keyAfter = key;
    } else {
      while (
        (content.getBlockForKey(keyAfter) &&
          content.getBlockForKey(keyAfter).getData().get('isShow') === false) ||
        (content.getBlockForKey(keyAfter) &&
          EMBEDS_BLOCK_TYPES.includes(
            content.getBlockForKey(keyAfter).getType() as BlockType
          ))
      ) {
        if (!content.getKeyAfter(keyAfter)) {
          break;
        } else {
          keyAfter = content.getKeyAfter(keyAfter);
        }
      }
    }

    return content.getBlockForKey(keyAfter);
  };

  return {
    getCurrentContentBlock,
    getPrevBlock,
    getVisiblePrevBlock,
    getVisibleNextBlock,
  };
};

export default useContentBlock;
