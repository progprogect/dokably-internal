import './style.css';

import { ContentBlock, EditorBlock } from 'draft-js';
import {
  getPlaceholder,
  getPrevNumberedBlocksWithSameLevel,
  getTab,
} from '@app/services/block.service';
import { useLayoutEffect, useMemo, useState } from 'react';

import BlockType from '@entities/enums/BlockType';
import Placeholder from '@widgets/components/Placeholder';

const NumberedListBlock = (props: any) => {
  const { block, contentState } = props;
  const isShow = useMemo(() => block.getData().get('isShow'), [block]);
  const placeholder = getPlaceholder(block.getType() as BlockType);

  const prevs = getPrevNumberedBlocksWithSameLevel(
    block,
    contentState.getBlocksAsArray()
  );

  const MemoizedEditorBlock = useMemo(() => <EditorBlock {...props} />, [block]);

  return isShow !== false ? (
    <div
      className='dokably-numbered-list-block__wrapper'
      style={{ paddingLeft: getTab(block.getDepth() + 1) }}
    >
      <div
        contentEditable={false}
        className='dokably-numbered-list-block__marker'
      >
        {prevs.length ? `${prevs.length}.` : ''}
      </div>
      <div className='dokably-numbered-list-block__editor-block'>
        <Placeholder
          content={placeholder}
          isShow={block.getText().length === 0}
        />
        {MemoizedEditorBlock}
      </div>
    </div>
  ) : null;
};

export default NumberedListBlock;
