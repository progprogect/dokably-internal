import './style.css';

import { EditorBlock, EditorState } from 'draft-js';
import { getPlaceholder, getTab } from '@app/services/block.service';

import BlockType from '@entities/enums/BlockType';
import { ReactComponent as CheckboxDisable } from '@images/checkboxDisable.svg';
import { ReactComponent as CheckboxEnable } from '@images/checkboxEnable.svg';
import useBlockData from '@app/hooks/editor/useBlockData';
import { useMemo } from 'react';
import Placeholder from '@widgets/components/Placeholder';

const CheckListBlock = (props: any) => {
  const { block } = props;
  const { store } = props.blockProps;
  const { setBlockDataValue } = useBlockData();
  const isShow = useMemo(() => block.getData().get('isShow'), [block]);
  const state = useMemo(() => block.getData().get('state'), [block]);
  const placeholder = getPlaceholder(block.getType() as BlockType);

  const handleChange = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    store.getItem('setEditorState')((prevState: EditorState) => {
      return setBlockDataValue(prevState, block, 'state', !state, true);
    });
  };

  const MemoizedEditorBlock = useMemo(() => <EditorBlock {...props} />, [block]);

  return isShow !== false ? (
    <div
      className='dokably-check-list-block__wrapper'
      style={{ paddingLeft: getTab(block.getDepth() + 1) }}
    >
      <div
        contentEditable={false}
        className='dokably-check-list-block__marker'
        onMouseDown={(event) => handleChange(event)}
      >
        {state === true ? <CheckboxEnable /> : <CheckboxDisable />}
      </div>
      <div className='dokably-check-list-block__editor-block'>
        <Placeholder
          content={placeholder}
          isShow={block.getText().length === 0}
        />
        {MemoizedEditorBlock}
      </div>
    </div>
  ) : null;
};

export default CheckListBlock;
