import { ContentBlock, ContentState, EditorState, genKey } from 'draft-js';
import { ReactComponent as Trash } from '@images/trash.svg';
import { ReactComponent as Duplicate } from '@images/duplicate.svg';
import { ReactComponent as ArrowRight } from '@images/arrowRight.svg';
import { ReactComponent as Extend } from '@images/extend.svg';
import { ReactComponent as Collapse } from '@images/collapse.svg';
import * as Immutable from 'immutable';

import './style.css';
import { selectBlockBefore } from '@app/services/document.service';
import useBlockData from '@app/hooks/editor/useBlockData';
import { useMemo } from 'react';
import { getUrl } from '@app/services/embed.service';

interface ContextOptions {
  delete?: boolean;
  duplicate?: boolean;
  open?: boolean;
  extend?: boolean;
}

interface IContextMenu {
  block: ContentBlock;
  store: any;
  options?: ContextOptions;
}

const ContextMenu = ({
  block,
  store,
  options = { delete: true },
}: IContextMenu) => {
  const { setBlockDataValue } = useBlockData();
  const isExtended = useMemo(() => block.getData().get('isExtended'), [block]);

  const handleDelete = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    store.getItem('setEditorState')((editorState: EditorState) => {
      const contentState = editorState.getCurrentContent();
      const selection = editorState.getSelection();
      const key = editorState.getSelection().getAnchorKey();
      const blockBeforeKey = editorState
        .getCurrentContent()
        .getKeyBefore(block.getKey());
      const blockBefore = editorState
        .getCurrentContent()
        .getBlockForKey(blockBeforeKey);
      const content = contentState
        .getBlockMap()
        .delete(block.getKey())
        .toOrderedMap();

      editorState = EditorState.push(
        editorState,
        ContentState.createFromBlockArray(content.toArray()),
        'remove-range',
      );
      if (block.getKey() === key) {
        editorState = EditorState.forceSelection(
          editorState,
          editorState.getSelection().merge({
            focusKey: blockBeforeKey,
            anchorKey: blockBeforeKey,
            focusOffset: blockBefore.getText().length,
            anchorOffset: blockBefore.getText().length,
          }),
        );
      } else {
        editorState = EditorState.forceSelection(editorState, selection);
      }

      return editorState;
    });
  };

  const handleDuplicate = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    store.getItem('setEditorState')((editorState: EditorState) => {
      const contentState = editorState.getCurrentContent();
      const selection = editorState.getSelection();
      const key = editorState.getSelection().getAnchorKey();
      const blockData = block.getData();
      const blockType = block.getType();
      const newBlock = new ContentBlock({
        key: genKey(),
        type: blockType,
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: Immutable.Map().set('state', blockData.get('state')),
      });

      let selectionState = editorState.getSelection();

      let newSelection = selectionState.merge({
        focusKey: newBlock.getKey(),
        anchorKey: newBlock.getKey(),
        focusOffset: 0,
        anchorOffset: 0,
      });

      const newBlockMap = contentState
        .getBlockMap()
        .set(newBlock.getKey(), newBlock);

      editorState = EditorState.push(
        editorState,
        ContentState.createFromBlockArray(newBlockMap.toArray()),
        'insert-fragment',
      );

      return EditorState.forceSelection(editorState, newSelection);
    });
  };

  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    window.open(getUrl(block.getText()), '_blank')?.focus();
  };

  const handleExtendExpand = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    store.getItem('setEditorState')((editorState: EditorState) => {
      editorState = setBlockDataValue(
        editorState,
        block,
        'isExtended',
        !isExtended,
      );
      editorState = selectBlockBefore(editorState, block.getKey());
      return editorState;
    });
  };

  return (
    <div
      className='dokably-context-menu'
      contentEditable={false}
    >
      {/* <div className='dokably-context-menu__item'>
        <Comment />
      </div> 
      <div className='dokably-context-menu__divider'></div>*/}
      {options?.open && (
        <div
          className='dokably-context-menu__item'
          onMouseDown={handleOpen}
        >
          <ArrowRight className='-rotate-45' />
        </div>
      )}
      {options?.extend && (
        <div
          className='dokably-context-menu__item'
          onMouseDown={handleExtendExpand}
        >
          {!isExtended && <Extend />}
          {isExtended && <Collapse />}
        </div>
      )}
      <div
        className='dokably-context-menu__item'
        onMouseDown={handleDelete}
      >
        <Trash className='[&>path]:stroke-fontRed' />
      </div>
      {options.duplicate && (
        <div
          className='dokably-context-menu__item'
          onMouseDown={handleDuplicate}
        >
          <Duplicate className='action-item__icon' />
        </div>
      )}
    </div>
  );
};

export default ContextMenu;
