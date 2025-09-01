import { getEntities } from '@app/utils/entity';
import './style.css';

import { v4 as uuidv4 } from 'uuid';
import { Dispatch, FormEvent, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { ReactComponent as NoMessages } from '@images/noMessages.svg';
import { EditorState, Modifier, SelectionState } from 'draft-js';
import CommentView from '@widgets/comment-view';
import { useLocalStorage } from 'usehooks-ts';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';
import { ReactComponent as Icon } from '@images/logo.svg';
import { ReactComponent as ArrowIcon } from '@shared/images/commentArrowIcon.svg';
import { Comment, Comment as CommentModel } from '@entities/models/Comment';
import useUser from '@app/hooks/useUser';
import { Mention, MentionsInput } from 'react-mentions';
import { useGetUnitMembersQuery } from '@app/queries/unit/members/useGetUnitMembersQuery';
import _ from 'lodash';
import { getMembersForUnit } from '@app/services/share.service';
import { selectMembersForSuggestions } from '@app/queries/unit/members/selectors/selectMembersForSuggestions';
import { mentionInputStyles } from '../comments-input/mentionsInputStyles';
import { mentionStyles } from '../comments-input/mentionStyles';
import { Unit } from '@entities/models/unit';

interface ICommentPanel {
  handleDeleteComment: (id: string) => void;
  handleReply: (id: string, message: string) => void;
  handleReplyDelete: (id: string, replyId: string) => void;
  editorState: EditorState;
  setEditorState: Dispatch<SetStateAction<EditorState>>;
  unit: Unit;
}

const CommentPanel = ({
  handleDeleteComment,
  handleReply,
  handleReplyDelete,
  editorState,
  setEditorState,
  unit,
}: ICommentPanel) => {
  const { readonly, setReadOnly } = useDokablyEditor();
  const user = useUser();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [commentText, setCommentText] = useState<string>('');

  const entities = getEntities(editorState, 'COMMENT');

  const [useId, setId] = useState('');

  const [, setLocalStorageCommentKey] = useLocalStorage('comment', '');
  const [useLocalStorageKey, setLocalStorageKey] = useLocalStorage('sidePanel', '');

  const unitMembersQueryResult = useGetUnitMembersQuery({ unitId: unit?.id }, getMembersForUnit, {
    enabled: !_.isNil(unit?.id),
    select: selectMembersForSuggestions,
  });

  useEffect(() => {
    // setReadOnly(true);
    const allElements: any = document.getElementsByClassName('comment-view');
    for (let i = 0; i < allElements.length; i++) {
      allElements[i].style.background = 'white';
    }
    if (useId !== '') {
      const oldWrap = document.getElementById(useId);
      setReadOnly(true);
      if (oldWrap != null) oldWrap.classList.remove('comments__inline_wrapper-active');
    }
    entities.map((comment) => {
      if (comment.entityKey === useLocalStorageKey) {
        setLocalStorageKey('');
        setTimeout(() => {
          const wrap = document.getElementById(comment.entityKey);
          setId(comment.entityKey);
          if (wrap != null) {
            wrap.classList.add('comments__inline_wrapper-active');
          }
          const element = document.getElementById(comment.entity.getData().id) as HTMLDivElement | null;
          if (element != null) {
            element.style.background = '#faf5e9';
            element.scrollIntoView();
          }
        }, 1);
      }
    });
  }, [useLocalStorageKey, readonly]);

  const addCommentIsDisabled = useMemo(() => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const blockKey = selection.getAnchorKey();
    const block = contentState.getBlockForKey(blockKey);
    const offset = selection.getStartOffset();
    const textUntilCursor = block.getText().slice(0, offset);
    const match = textUntilCursor.match(/(\S+)\s*$/);
    return !match;
  }, [editorState]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    if (commentText.length === 0) {
      return;
    }

    handleComment({
      id: uuidv4(),
      orderIndex: 0,
      date: new Date(),
      author: user.name ?? user.email,
      message: commentText,
      replies: [],
    } as Comment);
  };

  const handleComment = (comment: CommentModel) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const blockKey = selection.getAnchorKey();
    const block = contentState.getBlockForKey(blockKey);
    const offset = selection.getStartOffset();
    const textUntilCursor = block.getText().slice(0, offset);
    const match = textUntilCursor.match(/(\S+)\s*$/);
    if (!match) return;
    const word = match[1];
    const wordStart = offset - word.length;
    const wordEnd = offset;
    const entityKey = block.getEntityAt(wordStart);

    let newContentState;
    if (entityKey) {
      const entity = contentState.getEntity(entityKey);
      if (entity.getType() === 'COMMENT') {
        const oldData = entity.getData();
        const updatedComments = [...(oldData.comments || []), comment];
        contentState.replaceEntityData(entityKey, { comments: updatedComments });
        newContentState = contentState;
      }
    }

    if (!entityKey || newContentState == null) {
      const contentStateWithEntity = contentState.createEntity('COMMENT', 'MUTABLE', {
        comments: [comment],
      });
      const newEntityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const wordSelection = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: wordStart,
        focusOffset: wordEnd,
      });
      newContentState = Modifier.applyEntity(contentStateWithEntity, wordSelection, newEntityKey);
    }
    const newEditorState = EditorState.set(editorState, {
      currentContent: newContentState,
    });

    setEditorState(newEditorState);
    setLocalStorageCommentKey(comment.id);
    setCommentText('');
  };

  return (
    <div
      className={`comment__panel absolute !right-0 bg-[#fff] flex flex-col ${!entities.length ? 'justify-between' : ''}`}
    >
      <h3 className='comments__header'>Comments</h3>
      {entities.length ? (
        entities.map((comment, index) => {
          const isLast = index === entities.length - 1;
          return (
            <div className='comments__list' key={comment.entityKey}>
              {comment.entity.getData()?.comments?.map((c: Comment) => (
                <CommentView
                  key={c.id}
                  comment={c}
                  id={c.id}
                  onDelete={handleDeleteComment}
                  onReply={handleReply}
                  onReplyDelete={handleReplyDelete}
                  autofocus={false}
                  type='editor'
                  unitMembersQueryResultData={unitMembersQueryResult?.data ?? []}
                  isLast={isLast}
                />
              )) || []}
            </div>
          );
        })
      ) : (
        <>
          <div className='no-messages'>
            <NoMessages />
            <div className='mt-4 mb-2.5 text-center text-[18px] text-[#545356] font-medium'>No Comments yet</div>
            <p className='text-center text-[14px] text-[#69696B]'>Be the first to leave a comment.</p>
          </div>
          <div />
        </>
      )}
      <div className='fixed bottom-0 right-0 z-[1002] w-[320px] border-t border-[#eaeaea] bg-[#fff]'>
        <div className={`row items-center ml-5 mt-3 mb-5 ${addCommentIsDisabled ? 'opacity-50' : ''}`}>
          <div className='comment-view__icon'>{<Icon />}</div>
          <div className=''>
            <form
              className={'comment-view__form'}
              onSubmit={onSubmit}
            >
              <MentionsInput
                inputRef={inputRef}
                value={commentText}
                style={{
                  ...mentionInputStyles,
                  suggestions: {
                    ...mentionInputStyles.suggestions,
                    list: {
                      ...mentionInputStyles.suggestions.list,
                      bottom: 'calc(100% + 20px)',
                    },
                  },
                }}
                placeholder='Add a comment'
                onChange={(e) => setCommentText(e.target.value)}
                disabled={addCommentIsDisabled}
              >
                <Mention
                  data={unitMembersQueryResult.data ?? []}
                  trigger={'@'}
                  style={mentionStyles}
                  markup=',!__display__,!'
                />
              </MentionsInput>
              <button
                type='submit'
                disabled={commentText.length === 0}
              >
                <ArrowIcon />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentPanel;
