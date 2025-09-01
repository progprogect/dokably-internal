import './style.css';

import { getPlaceholder, getTab } from '@app/services/block.service';

import BlockType from '@entities/enums/BlockType';
import { ReactComponent as DotIcon } from '@images/lists/dot.svg';
import { EditorBlock } from 'draft-js';
import { useMemo } from 'react';
import Placeholder from '@widgets/components/Placeholder';

const BulletedListBlock = (props: any) => {
  const { block } = props;
  const isShow = useMemo(() => block.getData().get('isShow'), [block]);
  const placeholder = getPlaceholder(block.getType() as BlockType);

  const MemoizedEditorBlock = useMemo(() => <EditorBlock {...props} />, [block]);

  return isShow !== false ? (
    <div
      className='dokably-bulleted-list-block__wrapper'
      style={{ paddingLeft: getTab(block.getDepth() + 1) }}
    >
      <div
        contentEditable={false}
        className='dokably-bulleted-list-block__marker'
      >
        <DotIcon />
      </div>
      <div className='dokably-bulleted-list-block__editor-block'>
        <Placeholder
          content={placeholder}
          isShow={block.getText().length === 0}
        />
        {MemoizedEditorBlock}
      </div>
    </div>
  ) : null;
};

export default BulletedListBlock;
