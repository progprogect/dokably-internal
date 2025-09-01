import './style.css';

import { EditorBlock, EditorState } from 'draft-js';
import { getNestedBlocks, getPlaceholder, getTab } from '@app/services/block.service';
import { useCallback, useEffect, useMemo } from 'react';

import BlockType from '@entities/enums/BlockType';
import { ReactComponent as ToggleHide } from '@images/toggleHide.svg';
import { ReactComponent as ToggleShow } from '@images/toggleShow.svg';
import * as _ from 'lodash';
import cn from 'classnames';
import useBlockData from '@app/hooks/editor/useBlockData';
import useEditorState from '@app/hooks/editor/useEditorState';
import Placeholder from '@widgets/components/Placeholder';

const ToggleListBlock = (props: any) => {
  const { block, contentState } = props;
  const { store } = props.blockProps;
  const { setBlockDataValue, setBlockDataValues } = useBlockData();
  const { insertEmptyBlockAfter } = useEditorState();
  const isShow = useMemo(() => block.getData().get('isShow'), [block]);
  const isOpen = useMemo(() => block.getData().get('state') || false, [block]);
  const placeholder = getPlaceholder(block.getType() as BlockType);
  const isNestedChilds = useMemo(
    () => getNestedBlocks(block, contentState.getBlocksAsArray()).length > 0,
    [contentState],
  );

  const getMarkerState = useCallback(() => {
    let nestedBlocks = getNestedBlocks(block, store.getItem('getEditorState')().getCurrentContent().getBlocksAsArray());
    if (nestedBlocks.length === 0) {
      return isOpen;
    }

    return nestedBlocks.some((x) => x.getData().get('isShow') !== false);
  }, [contentState]);

  const marker = getMarkerState() ? (
    <ToggleShow
      className={cn({
        '[&>path]:fill-text40': !isNestedChilds,
      })}
    />
  ) : (
    <ToggleHide
      className={cn({
        '[&>path]:fill-text40': !isNestedChilds,
      })}
    />
  );

  useEffect(() => {
    store.getItem('setEditorState')((prevState: EditorState) => {
      let nestedBlocks = getNestedBlocks(block, prevState.getCurrentContent().getBlocksAsArray());
      if (
        nestedBlocks.length > 0 &&
        nestedBlocks.some((x) => x.getData().get('isShow') !== false) &&
        block.getData().get('state') === false
      ) {
        nestedBlocks.forEach((nestedBlock) => {
          prevState = setBlockDataValue(prevState, nestedBlock, 'isShow', true);
        });
        return setBlockDataValue(prevState, block, 'state', true);
      } else if (
        nestedBlocks.length > 0 &&
        nestedBlocks.every((x) => x.getData().get('isShow') === false) &&
        block.getData().get('state') === true
      ) {
        return setBlockDataValue(prevState, block, 'state', false);
      }
      return prevState;
    });
  }, [contentState]);

  const nestedBlockStateAsToggleState = (editorState: EditorState, isShow: boolean): EditorState => {
    const nestedBlocks = getNestedBlocks(block, editorState.getCurrentContent().getBlocksAsArray());
    nestedBlocks.forEach((nestedBlock) => {
      editorState = setBlockDataValue(editorState, nestedBlock, 'isShow', isShow);
    });

    return editorState;
  };

  const handleChange = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const newState = !getMarkerState();
    let selectionInBlock = true;
    store.getItem('setEditorState')((prevState: EditorState) => {
      selectionInBlock = prevState.getSelection().getAnchorKey() === block.getKey();

      let selectionState = prevState.getSelection();
      let newEditorState = setBlockDataValue(prevState, block, 'state', newState);

      newEditorState = nestedBlockStateAsToggleState(newEditorState, newState);

      if (selectionInBlock) {
        newEditorState = EditorState.forceSelection(newEditorState, selectionState);
      } else {
        newEditorState = EditorState.forceSelection(
          newEditorState,
          selectionState.merge({
            focusKey: block.getKey(),
            anchorKey: block.getKey(),
            focusOffset: block.getText().length,
            anchorOffset: block.getText().length,
          }),
        );
      }
      return newEditorState;
    });
  };

  const createNewBlockInside = () => {
    store.getItem('setEditorState')((prevState: EditorState) => {
      return insertEmptyBlockAfter(prevState, block.getKey(), {
        depth: block.getDepth() + 1,
      });
    });
  };
  const MemoizedEditorBlock = useMemo(() => <EditorBlock {...props} />, [block]);
  return isShow !== false ? (
    <div
      className='dokably-toggle-list-block__wrapper'
      style={{ paddingLeft: getTab(block.getDepth() + 1) }}
    >
      <div className='flex'>
        <div
          contentEditable={false}
          className='dokably-toggle-list-block__marker'
          onMouseDown={(event) => handleChange(event)}
        >
          {marker}
        </div>
        <div className='dokably-toggle-list-block__editor-block'>
          <Placeholder
            content={placeholder}
            isShow={block.getText().length === 0}
          />
          {MemoizedEditorBlock}
        </div>
      </div>
      {isOpen && !isNestedChilds && (
        <div
          className='cursor-pointer hover:bg-background w-full max-h-8.55 h-8.55 flex items-center rounded'
          style={{ marginLeft: '1.75rem' }}
          onClick={createNewBlockInside}
          contentEditable={false}
        >
          <span className='!select-none opacity-40'>Empty toggle. Click to create inside.</span>
        </div>
      )}
    </div>
  ) : null;
};

export default ToggleListBlock;
