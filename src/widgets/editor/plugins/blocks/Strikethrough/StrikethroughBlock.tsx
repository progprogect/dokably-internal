import { getPlaceholder, getTab } from '@app/services/block.service';

import BlockType from '@entities/enums/BlockType';
import { EditorBlock } from 'draft-js';
import Placeholder from '@widgets/components/Placeholder';
import { WrappedComponentProps } from '../../types';
import { useMemo } from 'react';

const StrikethroughBlock = (props: WrappedComponentProps) => {
  const { block } = props;
  const blockType = block.getType() as BlockType;

  const MemoizedEditorBlock = useMemo(() => <EditorBlock {...props} />, [block]);
  return blockType === BlockType.Strikethrough ? (
    <div
      className={props.className}
      style={{ paddingLeft: getTab(block.getDepth() + 1) }}
    >
      {block.getText().length === 0 && (
        <Placeholder
          content={getPlaceholder(blockType)}
          isShow
        />
      )}
      {MemoizedEditorBlock}
    </div>
  ) : null;
};

export default StrikethroughBlock;
