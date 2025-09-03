import { useEffect, useMemo, useState } from 'react';
import cn from 'classnames';
import { IDocumentDetails } from './DocumentDetails.types';
import { useDispatch } from 'react-redux';
import ShareButton from '@widgets/components/Actions/ShareButton/ShareButton.component';
import UnitsList from '@widgets/components/UnitsList/UnitsList.component';
import DokablyEditor from '@features/editor/DokablyEditor.component';
import { useLocalStorage } from 'usehooks-ts';
import { EditorState, Modifier, SelectionState } from 'draft-js';
import { setContentState } from '@app/services/document.service';
import _ from 'lodash';
import CommentsPanel from '@features/comments/comments-panel';
import { getEntities, getEntityRange, toggleEntity } from '@app/utils/entity';
import { v4 as uuidv4 } from 'uuid';
import { Comment } from '@entities/models/Comment';
import useUser from '@app/hooks/useUser';
import useForceUpdate from '@app/hooks/useForceUpdate';
import { setUpdate } from '@app/redux/features/commentsSlice';
import { UnitActionListBtn } from '@widgets/unit-action-lists/UnitActionListBtn';
import { DokablyEditorProvider } from '@features/editor/DokablyEditor.context';
import AnonymousGuestUserActionsPanel from './AnonymousGuestUserActionsPanel';
import useCommentButton from '@app/hooks/document/useCommentButton';
import useBreadcrumbs from '@app/hooks/useBreadcrumbs';
import ChatGPTAssistant from '@widgets/chatgpt-assistant';

const DocumentDetails = ({ unit, details }: IDocumentDetails) => {
  const [isHide] = useLocalStorage('sidebarHidden', false);
  const dispatch = useDispatch();
  const user = useUser();
  const isAnonymousGuestUser = useMemo(() => user?.email === 'anonymous', [user]);
  const [, forceUpdate] = useForceUpdate();
  const breadcrumbs = useBreadcrumbs(unit);

  const _editorState = useMemo(() => {
    const state = setContentState(Object(details.state).state, unit);
    const currentContent = state.getCurrentContent();
    const firstBlock = currentContent.getBlockMap().first();
    return EditorState.forceSelection(
      state,
      state.getSelection().merge({
        focusKey: firstBlock.getKey(),
        anchorKey: firstBlock.getKey(),
        focusOffset: firstBlock.getText().length,
        anchorOffset: firstBlock.getText().length,
      }),
    );
  }, [details, unit]);

  const [editorState, setEditorState] = useState<EditorState | null>(null);

  // Для гостей устанавливаем editorState только один раз, для обычных пользователей - при каждом изменении
  useEffect(() => {
    if (!_editorState) return;
    
    if (isAnonymousGuestUser) {
      // Для гостей устанавливаем состояние только один раз
      if (!editorState) {
        setEditorState(_editorState);
      }
    } else {
      // Для обычных пользователей обновляем при каждом изменении
      setEditorState(_editorState);
    }
  }, [_editorState, isAnonymousGuestUser, editorState]);

  // Не рендерим компонент, если нет editorState
  if (!editorState) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading document...</div>;
  }

  const commentEntities = useMemo(() => getEntities(editorState, 'COMMENT'), [editorState]);

  const handleDeleteComment = (id: string) => {
    const temp = commentEntities.map((x) => {
      return {
        entityKey: x.entityKey,
        comments: x.entity.getData()?.comments || [],
        blockKey: x.blockKey,
      };
    });

    const entity = temp.find((x) => x.comments.find((c: Comment) => c.id === id));
    if (!entity) return;

    if (entity?.comments.length === 1) {
      const key = entity.blockKey;
      let selection = editorState.getSelection();
      selection = SelectionState.createEmpty(key).merge({
        anchorKey: key,
        anchorOffset: 0,
        focusKey: key,
        focusOffset: 0,
      });
      let newState = EditorState.forceSelection(editorState, selection);
      const entityKey = entity.entityKey;
      const entityRange = getEntityRange(newState, entityKey);
      if (!entityRange) {
        // TODO: Cleanup before deploy to production
        console.error('No entity key in current selection state');
        return;
      }
      const isBackward = selection.getIsBackward();

      if (isBackward) {
        selection = selection.merge({
          anchorOffset: entityRange.end,
          focusOffset: entityRange.start,
        });
      } else {
        selection = selection.merge({
          anchorOffset: entityRange.start,
          focusOffset: entityRange.end,
        });
      }
      const updateEditor = (editorState: EditorState) => {
        let newState = toggleEntity(editorState, selection, null);
        EditorState.forceSelection(editorState, selection);
        const withoutComment = Modifier.applyEntity(newState.getCurrentContent(), newState.getSelection(), null);

        return setEditorState(EditorState.push(newState, withoutComment, 'apply-entity'));
      };
      updateEditor(editorState);
    } else {
      const element = entity.comments.find((x: Comment) => {
        const elemnt = x.id == id;
        return elemnt;
      });
      if (element !== undefined) {
        const index = entity.comments.indexOf(element);
        entity.comments.splice(index, 1);
        dispatch(setUpdate(1));
        forceUpdate();
      }
    }
  };

  const handleReply = (id: string, message: string) => {
    const temp = commentEntities.map((x) => {
      return {
        entityKey: x.entityKey,
        comment: x.entity.getData()?.comments?.find((comment: Comment) => comment.id === id) as Comment,
      };
    });

    const entity = temp.find((x) => x.comment?.id === id);

    if (user !== null && entity) {
      const reply = {
        id: uuidv4(),
        orderIndex: 0,
        date: new Date(),
        author: user.name ?? user.email,
        message: message,
      } as Comment;

      if (!entity.comment.replies) {
        entity.comment.replies = [{ ...reply }];
        dispatch(setUpdate(1));
      } else {
        entity.comment.replies.push(reply);
        dispatch(setUpdate(1));
      }
    }
  };

  const handleReplyDelete = (id: string, replyId: string) => {
    const temp = commentEntities.map((x) => {
      return {
        entityKey: x.entityKey,
        comment: x.entity.getData()?.comments?.find((comment: Comment) => comment.id === id) as Comment,
      };
    });
    const entity = temp.find((x) => x.comment?.id === id);
    if (!entity) return editorState;
    if (!entity.comment.replies) return editorState;
    const element = entity.comment.replies.find((x) => {
      const elemnt = x.id == replyId;
      return elemnt;
    });
    if (element !== undefined) {
      const index = entity.comment.replies.indexOf(element);
      entity.comment.replies.splice(index, 1);
      dispatch(setUpdate(1));
      forceUpdate();
    }
  };
  const { CommentButton, isCommentsPanelOpen } = useCommentButton();

  useEffect(() => {
    if (_editorState) setEditorState(_editorState);
  }, [_editorState]);

  return (
    <div className='workspace-details'>
      <header className='head-panel'>
        <div
          className={cn('bread-crumbs', {
            'bread-crumbs__withShowSidebarButton': isHide,
          })}
        >
          {breadcrumbs}
        </div>
        {isAnonymousGuestUser && (
          <AnonymousGuestUserActionsPanel
            unit={unit}
            CommentButton={CommentButton}
          />
        )}
        {!unit.isDefault && !isAnonymousGuestUser && (
          <div className='actions'>
            <CommentButton />
            <ShareButton
              unit={unit}
              withIcon={false}
            />
            <UnitActionListBtn
              popupAlign='end'
              size='l'
              unit={unit}
            />
          </div>
        )}
      </header>
      <div className='flex flex-row w-full flex-1'>
        <DokablyEditorProvider unit={unit}>
          <main
            className='workspace'
            id='workspace'
          >
            <DokablyEditor
              editorState={editorState}
              setEditorState={setEditorState}
              isInit
            />
            <UnitsList unitId={unit.id} />
          </main>
          {isCommentsPanelOpen && (
            <CommentsPanel
              unit={unit}
              handleDeleteComment={handleDeleteComment}
              handleReply={handleReply}
              handleReplyDelete={handleReplyDelete}
              editorState={editorState}
              setEditorState={setEditorState}
            />
          )}
        </DokablyEditorProvider>
      </div>
      <ChatGPTAssistant />
    </div>
  );
};

export default DocumentDetails;
