import {
  ContentBlock,
  ContentState,
  DraftRemovalDirection,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';
import { getBlocksBetween, getNestedBlocks } from '@app/services/block.service';

import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import UnicodeUtils from 'fbjs/lib/UnicodeUtils';
import useBlockData from './useBlockData';
import useBlockTypes from './useBlockTypes';
import useContentBlock from './useContentBlock';
import useInlineStyles from './useInlineStyles';

const gkx = (name: string) => {
  if (typeof window !== 'undefined' && (window as any).__DRAFT_GKX) {
    return !!(window as any).__DRAFT_GKX[name];
  }

  return false;
};
const experimentalTreeDataSupport = gkx('draft_tree_data_support');

export const useEditorEvents = (props: EditorProps) => {
  const { editorState, setEditorState } = props;
  const { riseBlockDepth, decreaseBlockDepth } = useBlockData();
  const { getCurrentContentBlock, getVisiblePrevBlock, getVisibleNextBlock } =
    useContentBlock();
  const { toggleBlockType } = useBlockTypes();
  const tabCommand = (): void => {
    const contentBlock = getCurrentContentBlock(editorState);
    setEditorState((editorState) => riseBlockDepth(editorState, contentBlock));
  };
  const { removeAllInlineStyles, removeStylesInNewLine } = useInlineStyles();

  const resetTypeCommand = (): void => {
    setEditorState((editorState) =>
      toggleBlockType(editorState, BlockType.Text)
    );
  };

  const decreaseBlockDepthCommand = (): void => {
    setEditorState((editorState) => {
      const contentBlock = getCurrentContentBlock(editorState);
      editorState = decreaseBlockDepth(editorState, contentBlock);
      let nestetBlocks = getNestedBlocks(
        contentBlock,
        editorState.getCurrentContent().getBlocksAsArray()
      );
      nestetBlocks.forEach((block: ContentBlock) => {
        editorState = decreaseBlockDepth(editorState, block);
      });
      return editorState;
    });
  };

  const keyCommandPlainBackspace = (editorState: EditorState): EditorState => {
    const blockBefore = getVisiblePrevBlock(
      editorState,
      editorState.getSelection().getAnchorKey()
    );
    const key = editorState.getSelection().getAnchorKey();
    const currentContentBlock = editorState
      .getCurrentContent()
      .getBlockForKey(key);
    let blocksBetween = getBlocksBetween(
      blockBefore,
      currentContentBlock,
      editorState.getCurrentContent().getBlocksAsArray()
    );
    let selectionStrategy;
    const afterRemoval = removeTextWithStrategy(
      editorState,
      function (strategyState) {
        const selection = strategyState.getSelection();
        const content = strategyState.getCurrentContent();
        const key = selection.getAnchorKey();
        const offset = selection.getAnchorOffset();
        const charBehind = content.getBlockForKey(key).getText()[offset - 1];
        selectionStrategy = moveSelectionBackward(
          strategyState,
          charBehind ? UnicodeUtils.getUTF16Length(charBehind, 0) : 1
        );
        return selectionStrategy;
      },
      'backward'
    );
    if (afterRemoval === editorState.getCurrentContent()) {
      return editorState;
    }
    let selection = editorState.getSelection();
    let content = afterRemoval;
    if (blocksBetween.length > 0) {
      const activeBlockIndex = content
        .getBlocksAsArray()
        .findIndex((el: ContentBlock) => el.getKey() === blockBefore.getKey());
      let newContentState = afterRemoval;
      const blocksBefore = newContentState
        .getBlockMap()
        .toSeq()
        .slice(0, activeBlockIndex + 1);
      const blocksAfter = newContentState.getBlockMap().slice(activeBlockIndex);
      const newBlockMap = blocksBefore
        .concat(blocksBetween, blocksAfter)
        .toOrderedMap();
      content = ContentState.createFromBlockArray(newBlockMap.toArray());
      if (
        selectionStrategy &&
        (selectionStrategy as SelectionState).getAnchorKey() !==
          (selectionStrategy as SelectionState).getFocusKey()
      ) {
        selection = selection.merge({
          focusKey: blockBefore.getKey(),
          anchorKey: blockBefore.getKey(),
          focusOffset: blockBefore.getText().length,
          anchorOffset: blockBefore.getText().length,
        });
      } else {
        selection = selectionStrategy ?? selection;
      }
      let newEditorState = EditorState.push(
        editorState,
        content,
        selection.isCollapsed() ? 'backspace-character' : 'remove-range'
      );
      return EditorState.forceSelection(newEditorState, selection);
    }
    editorState = EditorState.push(
      editorState,
      content.set('selectionBefore', selection) as ContentState,
      selection.isCollapsed() ? 'backspace-character' : 'remove-range'
    );

    const firstBlock = editorState.getCurrentContent().getBlockMap().first();
    editorState = removeAllInlineStyles(editorState, firstBlock.getKey());

    return editorState;
  };

  const keyCommandPlainDelete = (editorState: EditorState) => {
    const blockAfter = getVisibleNextBlock(
      editorState,
      editorState.getSelection().getAnchorKey()
    );
    const key = editorState.getSelection().getAnchorKey();
    const currentContentBlock = editorState
      .getCurrentContent()
      .getBlockForKey(key);
    let blocksBetween = getBlocksBetween(
      currentContentBlock,
      blockAfter || currentContentBlock,
      editorState.getCurrentContent().getBlocksAsArray()
    );
    let selectionStategy;

    const afterRemoval = removeTextWithStrategy(
      editorState,
      (strategyState) => {
        const selection = strategyState.getSelection();
        const content = strategyState.getCurrentContent();
        const key = selection.getAnchorKey();
        const offset = selection.getAnchorOffset();
        const charAhead = content.getBlockForKey(key).getText()[offset];
        selectionStategy = moveSelectionForward(
          strategyState,
          charAhead ? UnicodeUtils.getUTF16Length(charAhead, 0) : 1
        );
        return selectionStategy;
      },
      'forward'
    );

    if (afterRemoval === editorState.getCurrentContent()) {
      return editorState;
    }
    let selection = editorState.getSelection();
    let content = afterRemoval;
    if (blocksBetween.length > 0) {
      const activeBlockIndex = content
        .getBlocksAsArray()
        .findIndex((el: ContentBlock) => el.getKey() === currentContentBlock.getKey());
      let newContentState = afterRemoval;
      const blocksBefore = newContentState
        .getBlockMap()
        .toSeq()
        .slice(0, activeBlockIndex + 1);
      const blocksAfter = newContentState.getBlockMap().slice(activeBlockIndex);
      const newBlockMap = blocksBefore.concat(blocksBetween, blocksAfter).toOrderedMap();
      content = ContentState.createFromBlockArray(newBlockMap.toArray());

      let newEditorState = EditorState.push(
        editorState,
        content,
        selection.isCollapsed() ? 'backspace-character' : 'remove-range'
      );
      return EditorState.forceSelection(newEditorState, selection);
    }
    
    editorState = EditorState.push(
      editorState,
      content.set('selectionBefore', selection) as ContentState,
      selection.isCollapsed() ? 'delete-character' : 'remove-range'
    );

    const firstBlock = editorState.getCurrentContent().getBlockMap().first();
    editorState = removeAllInlineStyles(editorState, firstBlock.getKey());

    return editorState;
  };

  const keyCommandInsertNewline = (editorState: EditorState) => {
    const contentState = Modifier.splitBlock(
      editorState.getCurrentContent(),
      editorState.getSelection(),
    );
    editorState = EditorState.push(editorState, contentState, 'split-block');
    const newBlockKey = editorState.getSelection().getAnchorKey();
    const newBlock = editorState.getCurrentContent().getBlockForKey(newBlockKey);
    if (newBlock && newBlock.getText().length === 0) {
      editorState = removeStylesInNewLine(editorState);
    }
    return editorState
  }

  // private

  const moveSelectionBackward = (
    editorState: EditorState,
    maxDistance: number
  ) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const key = selection.getStartKey();
    const offset = selection.getStartOffset();
    let focusKey = key;
    let focusOffset = 0;

    if (maxDistance > offset) {
      const keyBefore = content.getKeyBefore(key);

      if (keyBefore == null) {
        focusKey = key;
      } else {
        const blockBefore = getVisiblePrevBlock(editorState, key);

        focusKey = blockBefore.getKey();

        focusOffset = blockBefore.getText().length;
      }
    } else {
      focusOffset = offset - maxDistance;
    }

    return selection.merge({
      focusKey: focusKey,
      focusOffset: focusOffset,
      isBackward: true,
    });
  };

  const moveSelectionForward = (
    editorState: EditorState,
    maxDistance: number
  ) => {
    var selection = editorState.getSelection();
    var key = selection.getStartKey();
    var offset = selection.getStartOffset();
    var content = editorState.getCurrentContent();
    var focusKey = key;
    var focusOffset;
    var block = content.getBlockForKey(key);

    if (maxDistance > block.getText().length - offset) {
      const blockAfter = getVisibleNextBlock(editorState, key);
      focusKey = blockAfter.getKey();
      focusOffset = 0;
    } else {
      focusOffset = offset + maxDistance;
    }

    return selection.merge({
      focusKey: focusKey,
      focusOffset: focusOffset,
    });
  };

  const removeTextWithStrategy = (
    editorState: EditorState,
    strategy: (editorState: EditorState) => SelectionState,
    direction: DraftRemovalDirection
  ): ContentState => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    let target = selection;
    const anchorKey = selection.getAnchorKey();
    const focusKey = selection.getFocusKey();
    const anchorBlock = content.getBlockForKey(anchorKey);

    if (experimentalTreeDataSupport) {
      if (direction === 'forward') {
        if (anchorKey !== focusKey) {
          return content;
        }
      }
    }

    if (selection.isCollapsed()) {
      if (direction === 'forward') {
        if (editorState.isSelectionAtEndOfContent()) {
          return content;
        }

        if (experimentalTreeDataSupport) {
          const isAtEndOfBlock =
            selection.getAnchorOffset() ===
            content.getBlockForKey(anchorKey).getLength();

          if (isAtEndOfBlock) {
            const anchorBlockSibling = content.getBlockForKey(
              (anchorBlock as any).nextSibling
            );

            if (!anchorBlockSibling || anchorBlockSibling.getLength() === 0) {
              return content;
            }
          }
        }
      } else if (editorState.isSelectionAtStartOfContent()) {
        return content;
      }

      target = strategy(editorState);

      if (target === selection) {
        return content;
      }
    }
    return Modifier.removeRange(content, target, direction);
  };

  return {
    tabCommand,
    resetTypeCommand,
    decreaseBlockDepthCommand,
    keyCommandPlainBackspace,
    keyCommandPlainDelete,
    keyCommandInsertNewline,
  };
};
