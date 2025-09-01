import { getPlaceholder, getTab } from '@app/services/block.service';

import BlockType from '@entities/enums/BlockType';
import { Editor, EditorBlock } from 'draft-js';
import Placeholder from '@widgets/components/Placeholder';
import { WrappedComponentProps } from '../../types';

const TextBlock = (props: WrappedComponentProps) => {
  const { block } = props;
  const { store } = props.blockProps;

  const key = block.getKey();
  const getEditorState = store.getItem('getEditorState');
  const editor = store.getItem('getEditorRef')?.() as Editor | undefined;
  const isShow = block.getData().get('isShow');
  const isActive = key === getEditorState?.().getSelection().getAnchorKey();
  const placeholder = getPlaceholder(block.getType() as BlockType);

  const isReadonly = editor?.props.readOnly;


  return isShow !== false ? (
    <div
      className={props.className}
      style={{ paddingLeft: getTab(block.getDepth() + 1) }}
    >
      <Placeholder
        content={placeholder}
        isShow={block.getText().length === 0 && isActive && !isReadonly}
        style={{ paddingLeft: getTab(block.getDepth() + 1) }}
      />
      <EditorBlock {...props} />
    </div>
  ) : null;
};

export default TextBlock;
