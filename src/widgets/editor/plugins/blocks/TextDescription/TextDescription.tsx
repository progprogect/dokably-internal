import { EditorBlock, EditorState } from 'draft-js';
import { useEditorSelection } from '@app/hooks/editor/useEditorSelection';
import './style.css';

import Placeholder from '@widgets/components/Placeholder';
import { useMemo } from 'react';

const TextDescription = (props: any) => {
  const placeholder = 'Untitled';
  const { block } = props;
  const { store } = props.blockProps;

  const { handleClickInEditor } = useEditorSelection();

  const handleClick = (event: React.MouseEvent) => {
    store.getItem('setEditorState')((editorState: EditorState) => {
      return handleClickInEditor(editorState, event, true);
    });
  };
  const MemoizedEditorBlock = useMemo(() => <EditorBlock {...props} />, [block]);
  return (
    <div className='relative w-[100%]'>
      {/* <div className='dokably-title-block__before' contentEditable={false}>
        <div className='dokably-title-block__before__item'>Add icon</div>
        <div className='dokably-title-block__before__item'>Add cover image</div>
      </div> */}
      {/* <div className='dokably-title-block__editor-block'>
        <Placeholder
          content={placeholder}
          isShow={block.getText().length === 0}
        />
        {MemoizedEditorBlock}
      </div> */}
      {(store.getItem('getEditorState')() as EditorState)
        .getCurrentContent()
        .getBlocksAsArray().length === 1 && (
        <div className='dokably-title-block__after' contentEditable={false}>
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
              >/</span>
              to browse options
            </span>
          </div>
          {/* <div className='dokably-title-block__after__right-menu'>
            <Tippy
              duration={0}
              content='Add link'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
            >
              <div className='dokably-title-block__after__right-menu__icon'>
                <LinkIcon />
              </div>
            </Tippy>
            <Tippy
              duration={0}
              content='Add image'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
            >
              <div className='dokably-title-block__after__right-menu__icon'>
                <ImageIcon />
              </div>
            </Tippy>
            <Tippy
              duration={0}
              content='Add kanban board'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
            >
              <div className='dokably-title-block__after__right-menu__icon'>
                <KanbanIcon />
              </div>
            </Tippy>
            <Tippy
              duration={0}
              content='Add table'
              className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
            >
              <div className='dokably-title-block__after__right-menu__icon'>
                <TableIcon />
              </div>
            </Tippy>
            <div className='dokably-title-block__after__right-menu__divider'></div>
            <div className='dokably-title-block__after__right-menu__more'>
              More
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default TextDescription;
