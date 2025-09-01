import { Comment as CommentModel } from '@entities/models/Comment';
import { ReactComponent as Icon } from '@images/logo.svg';
import { ReactComponent as ArrowIcon } from '@shared/images/commentArrowIcon.svg';
import './style.css';
import MoreButtonCommentsComponent from './more-button';
import { useRef, useState } from 'react';
import { getDate } from '@app/utils/date';
import { Mention, MentionsInput, SuggestionDataItem } from 'react-mentions';
import { mentionInputStyles } from '@features/comments/comments-input/mentionsInputStyles';
import { mentionStyles } from '@features/comments/comments-input/mentionStyles';
import { useWorkspaceContext } from '@app/context/workspace/context';
import useUser from '@app/hooks/useUser';

interface ICommentView {
  comment: CommentModel;
  replies?: CommentModel[];
  onDelete: (id: string) => void;
  onEdit?: () => void;
  onReply?: (id: string, message: string) => void;
  onReplyDelete?: (id: string, replyId: string) => void;
  id: string;
  autofocus: boolean;
  type: string;
  canReply?: boolean;
  unitMembersQueryResultData?: SuggestionDataItem[] | null;
  isLast?: boolean;
}

const CommentView = ({
  comment,
  replies,
  onDelete,
  onReply,
  onReplyDelete,
  id,
  autofocus,
  type,
  canReply = true,
  unitMembersQueryResultData,
  isLast,
}: ICommentView) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const { activeWorkspace } = useWorkspaceContext();
  const user = useUser();

  // Определяем, является ли пользователь гостем
  const isGuest = activeWorkspace?.userRole === 'guest' || user?.email === 'anonymous';

  const handleSendReply = (event: any) => {
    event.preventDefault();
    if (onReply !== undefined) onReply(comment.id, replyText);
    setReplyText('');
    inputRef.current?.focus();
  };

  const commentMessage = comment.message.replace(
    /(\@\S+)/g,
    (key) => `<span class="mention__view">${key}</span>`,
  );

  return (
    <div
      className={type === 'task' ? 'comment-view-task' : 'comment-view'}
      id={id}
    >
      <div
        className={
          type === 'task'
            ? 'comment-view__comments-task'
            : 'comment-view__comments'
        }
      >
        <div className='comment-view__icon'>
          <Icon />
        </div>
        <div className={type === 'task' ? 'flex-1' : 'w-[240px]'}>
          <div className='comment-view__title-row'>
            <div className='row gap-2'>
              <span className='comment-view__author'>{comment.author}</span>
              <span className='comment-view__date'>{getDate(comment)}</span>
            </div>
            <MoreButtonCommentsComponent
              onDelete={() => {
                onDelete(comment.id);
              }}
            />
          </div>
          <div className='comment-view__message'>
            <span
              dangerouslySetInnerHTML={{
                __html: commentMessage.replaceAll(',!', ''),
              }}
            ></span>
          </div>
          {canReply && (replies || comment.replies) !== undefined
            ? (replies || comment.replies)!.length > 0 && (
                <div className='flex-1 mt-[2px]'>
                  <div className='comment-view__title-row column'>
                    {(replies || comment.replies)!.map((reply) => (
                      <div
                        key={reply.id}
                        className='comment-view__reply'
                      >
                        <div className='comment-view__title-row'>
                          <div className='row gap-2'>
                            <span className='comment-view__author'>
                              {reply.author}
                            </span>
                            <span className='comment-view__date'>
                              {getDate(reply)}
                            </span>
                          </div>
                          <MoreButtonCommentsComponent
                            onDelete={() => {
                              onReplyDelete?.(comment.id, reply.id);
                            }}
                          />
                        </div>
                        <div className='comment-view__message'>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: reply.message.replace(
                                /(\@\S+)/g,
                                (key) => `<span class="mention__view">${key}</span>`,
                              ).replaceAll(',!', ''),
                            }}
                          ></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            : ''}
        </div>
      </div>
      {canReply && (
        <div className='row'>
          <div className='comment-view__icon comment-view__icon_input min-w-[20px]'>
            {<Icon />}
          </div>
          <div className='w-[728px] mt-[20px]'>
            <form
              className={
                type === 'task'
                  ? 'comment-view__form-task'
                  : 'comment-view__form'
              }
              onSubmit={handleSendReply}
            >
              {/* <input
                ref={inputRef}
                type='textarea'
                placeholder='Reply'
                onChange={(e) => {
                  setReplyText(e.target.value);
                }}
                value={replyText}
                autoFocus={autofocus}
              /> */}

              {!isGuest ? (
                <MentionsInput
                  inputRef={inputRef}
                  value={replyText}
                  style={isLast ? { ...mentionInputStyles, suggestions: {
                    ...mentionInputStyles.suggestions,
                    list: {
                      ...mentionInputStyles.suggestions.list,
                      bottom: "calc(100% + 20px)"
                    }
                  }} : mentionInputStyles}
                  placeholder='Reply'
                  onChange={(e) => setReplyText(e.target.value)}
                  autoFocus={autofocus}
                >
                  <Mention
                    data={unitMembersQueryResultData ?? []}
                    trigger={'@'}
                    style={mentionStyles}
                    markup=',!__display__,!'
                  />
                </MentionsInput>
              ) : (
                // Для гостей используем обычный input без функционала упоминаний
                <input
                  ref={inputRef}
                  value={replyText}
                  placeholder='Reply'
                  onChange={(e) => setReplyText(e.target.value)}
                  autoFocus={autofocus}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              <button
                type='submit'
                disabled={replyText.length === 0}
              >
                <ArrowIcon />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentView;
