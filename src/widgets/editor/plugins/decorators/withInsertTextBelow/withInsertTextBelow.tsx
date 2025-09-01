import styles from './styles.module.scss';

import { PluginBlockPropsToRender, PluginBlockToRender, PluginProps } from '../../types';
import useEditorState from '@app/hooks/editor/useEditorState';
import BlockType from '@entities/enums/BlockType';

export const withInsertTextBelow = <P extends PluginBlockPropsToRender>(WrappedComponent: PluginBlockToRender<P>) => {
  return (props: PluginProps<P>) => {
    const block = props.block;
    const blockKey = props.block.getKey();
    const store = props.blockProps.store;
    const getEditorState = store.getItem('getEditorState');
    const setEditorState = store.getItem('setEditorState');
    const editorState = getEditorState?.();
    if (!editorState) return null;
    const { insertEmptyBlockAfter } = useEditorState();

    const handleInsertTextBlock = () => {
      const newEditorState = insertEmptyBlockAfter(editorState, blockKey, {
        type: BlockType.Text,
        text: '',
        depth: block.getDepth(),
      });

      setEditorState?.(newEditorState);
    };

    return (
      <div>
        <WrappedComponent {...props} />
        <div
          className={styles.button}
          onClick={handleInsertTextBlock}
          contentEditable={false}
        />
      </div>
    );
  };
};
