import { ContentState, EditorBlock, EditorState, convertToRaw } from 'draft-js';
import { useEditorSelection } from '@app/hooks/editor/useEditorSelection';
import './style.css';
import Placeholder from '@widgets/components/Placeholder';
import CoverImage from '@widgets/cover-image/CoverImage';
import { DEFAULT_COVERS } from '@app/constants/defaultImageCovers';
import { useCallback, useMemo } from 'react';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';
import { useDispatch } from 'react-redux';
import { changeEmoji } from '@app/redux/features/unitsSlice';
import { useParams } from 'react-router-dom';
import { setDocument } from '@app/services/document.service';

const TitleBlock = (props: any) => {
  const readonly = props.readonly;
  const { setReadOnly } = useDokablyEditor();
  const placeholder = 'Untitled';
  const { block } = props;
  const { store } = props.blockProps;
  const { setEditorState } = props.blockProps;
  const dispatch = useDispatch();
  const { documentId } = useParams();
  const editorState = store.getItem('getEditorState')() as EditorState;

  const { handleClickInEditor } = useEditorSelection();

  const handleClick = (event: React.MouseEvent) => {
    store.getItem('setEditorState')((editorState: EditorState) => {
      return handleClickInEditor(editorState, event, true);
    });
  };
  const updateEmoji = useCallback(
    (key: string, value: string, newEditorState: EditorState) => {
      if (key == 'emoji') {
        dispatch(changeEmoji({ id: documentId, emoji: value }));
        setDocument(documentId as string, JSON.stringify(convertToRaw(newEditorState.getCurrentContent())));
      }
    },
    [dispatch, documentId, setDocument],
  );

  const saveCover = (key: string, value: string) => {
    setReadOnly(false);
    const contentState = editorState.getCurrentContent();
    const currentBlock = contentState.getBlockForKey(block.key) as any;
    const updatedBlock = currentBlock.set('data', currentBlock.getData().merge({ [key]: value }));
    const updatedContentState = contentState.merge({
      blockMap: contentState.getBlockMap().set(currentBlock.key, updatedBlock),
    }) as ContentState;
    const newEditorState = EditorState.push(editorState, updatedContentState, 'change-block-data');
    setEditorState(newEditorState);
    updateEmoji(key, value, newEditorState);
  };

  const editCover = (key: string, value: string) => {
    setReadOnly(false);
    const contentState = editorState.getCurrentContent();
    const currentBlock = contentState.getBlockForKey(block.key) as any;
    const updatedBlock = currentBlock.set('data', currentBlock.getData().set(key, value));
    const updatedContentState = contentState.merge({
      blockMap: contentState.getBlockMap().set(currentBlock.key, updatedBlock),
    }) as ContentState;
    const newEditorState = EditorState.push(editorState, updatedContentState, 'change-block-data');
    setEditorState(newEditorState);
    updateEmoji(key, value, newEditorState);
  };

  const deleteCover = (key: string) => {
    setReadOnly(false);
    const contentState = editorState.getCurrentContent();
    const currentBlock = contentState.getBlockForKey(block.key) as any;
    const updatedBlock = currentBlock.set('data', currentBlock.getData().delete(key));
    const updatedContentState = contentState.merge({
      blockMap: contentState.getBlockMap().set(currentBlock.key, updatedBlock),
    }) as ContentState;
    const newEditorState = EditorState.push(editorState, updatedContentState, 'change-block-data');
    setEditorState(newEditorState);
    updateEmoji(key, '', newEditorState);
  };

  const img = block.getData().get('link');
  const icon = block.getData().get('emoji');
  const MemoizedEditorBlock = useMemo(() => <EditorBlock {...props} />, [block]);
  return (
    <div className='relative w-full'>
      <CoverImage
        imgArr={DEFAULT_COVERS}
        saveCover={saveCover}
        editCover={editCover}
        deleteCover={deleteCover}
        img={img}
        icon={icon}
        readonly={readonly}
      />
      <div className='dokably-title-block__editor-block'>
        <Placeholder
          content={placeholder}
          isShow={block.getText().length === 0}
        />
        {MemoizedEditorBlock}
      </div>
      {(store.getItem('getEditorState')() as EditorState).getCurrentContent().getBlocksAsArray().length === 1 && (
        <div
          className='dokably-title-block__after'
          contentEditable={false}
        >
          <div
            className='dokably-title-block__after__left-menu'
            onClick={handleClick}
          >
            <span>
              Type
              <span
                style={{
                  background: '#f7f7f8',
                  borderRadius: '4px',
                  margin: '0px 5px',
                  padding: '0px 7px',
                }}
              >
                /
              </span>
              to browse options
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TitleBlock;
