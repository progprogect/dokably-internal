import React from 'react';
import cssStyles from './Table.module.scss';
import { CopyPlusIcon, TrashIcon } from 'lucide-react';
import { ContentBlock, ContentState, EditorState, genKey } from 'draft-js';
import * as Immutable from 'immutable';

interface Props {
  setAnchorMenuIsOpen: (value: boolean) => void;
  block: ContentBlock;
  store: any;
}

export const BannerAnchorMenu = (props: Props) => {
  const { store, block, setAnchorMenuIsOpen } = props;

  const handleDuplicate = () => {
    store.getItem('setEditorState')((editorState: EditorState) => {
      const contentState = editorState.getCurrentContent();
      const selection = editorState.getSelection();
      const blockData = block.getData();
      const blockType = block.getType();
      const blockKey = block.getKey();

      const newBlock = new ContentBlock({
        key: genKey(),
        type: blockType,
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: Immutable.Map().set('state', blockData.get('state')),
        text: block.getText(),
      });

      const blockMap = contentState.getBlockMap();
      const blockArray = blockMap.toArray();
      const currentBlockIndex = blockArray.findIndex((b) => b.getKey() === blockKey);

      blockArray.splice(currentBlockIndex + 1, 0, newBlock);

      const newContentState = ContentState.createFromBlockArray(blockArray);

      const newSelection = selection.merge({
        focusKey: blockKey,
        anchorKey: blockKey,
      });

      editorState = EditorState.push(editorState, newContentState, 'insert-fragment');
      editorState = EditorState.forceSelection(editorState, newSelection);

      return editorState;
    });
  };

  const handleDelete = () => {
    store.getItem('setEditorState')((editorState: EditorState) => {
      const contentState = editorState.getCurrentContent();
      const selection = editorState.getSelection();
      const blockKey = block.getKey();
      const blockBeforeKey = contentState.getKeyBefore(blockKey);

      if (!blockBeforeKey) {
        const blockAfterKey = contentState.getKeyAfter(blockKey);
        if (blockAfterKey) {
          const content = contentState.getBlockMap().delete(blockKey).toOrderedMap();
          const newContent = ContentState.createFromBlockArray(content.toArray());

          editorState = EditorState.push(editorState, newContent, 'remove-range');

          return editorState;
        }
      }

      if (blockBeforeKey) {
        const blockBefore = contentState.getBlockForKey(blockBeforeKey);
        const content = contentState.getBlockMap().delete(blockKey).toOrderedMap();
        const newContent = ContentState.createFromBlockArray(content.toArray());

        editorState = EditorState.push(editorState, newContent, 'remove-range');

        editorState = EditorState.forceSelection(
          editorState,
          selection.merge({
            focusKey: blockBeforeKey,
            anchorKey: blockBeforeKey,
            focusOffset: blockBefore.getText().length,
            anchorOffset: blockBefore.getText().length,
          }),
        );

        return editorState;
      }

      const content = contentState.getBlockMap().delete(blockKey).toOrderedMap();
      if (content.size === 0) {
        const emptyBlock = new ContentBlock({
          key: genKey(),
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: Immutable.Map(),
        });

        const newContent = ContentState.createFromBlockArray([emptyBlock]);

        editorState = EditorState.push(editorState, newContent, 'remove-range');
        editorState = EditorState.forceSelection(
          editorState,
          selection.merge({
            focusKey: emptyBlock.getKey(),
            anchorKey: emptyBlock.getKey(),
            focusOffset: 0,
            anchorOffset: 0,
          }),
        );
      } else {
        editorState = EditorState.push(
          editorState,
          ContentState.createFromBlockArray(content.toArray()),
          'remove-range',
        );
        editorState = EditorState.forceSelection(editorState, selection);
      }

      return editorState;
    });
  };

  const buttons = [
    {
      onClick: () => {
        handleDuplicate();
        setAnchorMenuIsOpen(false);
      },
      icon: <CopyPlusIcon />,
      label: 'Duplicate',
    },
    {
      onClick: () => {
        handleDelete();
        setAnchorMenuIsOpen(false);
      },
      icon: <TrashIcon />,
      label: 'Delete',
    },
  ];

  return (
    <div>
      <div
        className='bg-white shadow-5 border-radius-md'
        style={{ width: 212 }}
      >
        <div className={cssStyles.listPadding}>
          {buttons.map((button) => (
            <button
              type='button'
              className='sort-button'
              onPointerDown={button.onClick}
              key={button.label}
            >
              <span className='svg-icon svg-text icon-margin'>{button.icon}</span>
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
