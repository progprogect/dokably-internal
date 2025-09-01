import './style.css';

import { getPlaceholder, getTab } from '@app/services/block.service';

import BlockType from '@entities/enums/BlockType';
import { EditorBlock } from 'draft-js';
import cn from 'classnames';
import { useMemo } from 'react';
import Placeholder from '@widgets/components/Placeholder';

const HeadingBlock = (props: any) => {
  const { block } = props;
  const isShow = useMemo(() => block.getData().get('isShow'), [block]);
  const placeholder = getPlaceholder(block.getType() as BlockType);

  const MemoizedEditorBlock = useMemo(() => <EditorBlock {...props} />, [block]);
  return isShow !== false ? (
    <div
      className='dokably-heading-block__wrapper'
      style={{ paddingLeft: getTab(block.getDepth() + 1) }}
    >
      <div
        className={cn('dokably-heading-block__editor-block', {
          'dokably-heading-block__editor-block__heading1':
            block.getType() === BlockType.Heading1,
          'dokably-heading-block__editor-block__heading2':
            block.getType() === BlockType.Heading2,
          'dokably-heading-block__editor-block__heading3':
            block.getType() === BlockType.Heading3,
        })}
      >
        <Placeholder
          content={placeholder}
          isShow={block.getText().length === 0}
        />
        {MemoizedEditorBlock}
      </div>
    </div>
  ) : null;
};

export default HeadingBlock;
