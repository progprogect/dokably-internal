import { FormEvent, useRef, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { Mention, MentionsInput } from 'react-mentions';
import { useParams } from 'react-router-dom';
import { track } from '@amplitude/analytics-browser';

import useUser from '@app/hooks/useUser';
import { useGetUnitMembersQuery } from '@app/queries/unit/members/useGetUnitMembersQuery';
import { selectMembersForSuggestions } from '@app/queries/unit/members/selectors/selectMembersForSuggestions';
import { getMembersForUnit } from '@app/services/share.service';
import { ReactComponent as ArrowIcon } from '@shared/images/commentArrowIcon.svg';
import { ReactComponent as MentionIcon } from '@shared/images/icons/mention-icon.svg';
import { Comment } from '@entities/models/Comment';
import { cn } from '@app/utils/cn';

import { mentionInputStyles } from './mentionsInputStyles';
import { mentionStyles } from './mentionStyles';
import styles from './style.module.css';
import { Unit } from '@entities/models/unit';
import { useWorkspaceContext } from '@app/context/workspace/context';

export type CommentsInputProps = {
  className?: string;
  onComment: (comment: Comment) => void;
  preserveSelection?: boolean;
  onCancel?: () => void;
  unit?: Unit;
  isLast?: boolean;
};

const CommentsInput = ({ onComment, className, preserveSelection = false, onCancel, isLast }: CommentsInputProps) => {
  const [commentMessage, setCommentMessage] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const user = useUser();
  const { documentId } = useParams();
  const { activeWorkspace } = useWorkspaceContext();

  // Проверяем, является ли пользователь гостем (anonymous)
  const isGuestUser = user?.email === 'anonymous';

  // Отладочная информация
  console.log('CommentsInput Debug:', {
    user,
    userEmail: user?.email,
    isGuestUser,
    hasUser: !!user,
    userType: typeof user,
    userKeys: user ? Object.keys(user) : 'no user',
    documentId,
    activeWorkspace
  });

  const unitMembersQueryResult = useGetUnitMembersQuery({ unitId: documentId }, getMembersForUnit, {
    enabled: !_.isNil(documentId), // Временно включаем для всех
    select: selectMembersForSuggestions,
  });

  // Отладочная информация о запросе участников
  console.log('Unit Members Query Debug:', {
    enabled: !_.isNil(documentId),
    documentId,
    data: unitMembersQueryResult.data,
    isLoading: unitMembersQueryResult.isLoading,
    error: unitMembersQueryResult.error
  });

  // Автофокус только если не нужно сохранять selection
  useEffect(() => {
    if (!preserveSelection && inputRef.current) {
      // Задержка для правильной работы с Popover
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [preserveSelection]);

  // Обработка клика вне компонента
  useEffect(() => {
    if (!onCancel) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const commentContainer = document.querySelector('.comment__input-view');

      if (commentContainer && !commentContainer.contains(target)) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCancel]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    track('document_edit_style_selected', {
      path: 'floating',
      option: 'comment',
    });

    if (commentMessage.length === 0) {
      return;
    }

    const newComment = {
      id: uuidv4(),
      orderIndex: 0,
      date: new Date(),
      author: user.name ?? user.email,
      message: commentMessage,
      replies: [],
    } as Comment;
    
    onComment(newComment);

    setCommentMessage('');
    inputRef.current?.blur();
  };

  const insertMentionTrigger = () => {
    const el = inputRef.current;
    if (!el) return;
    const cursorPos = el.selectionStart || 0;
    const currentValue = el.value;
    const newValue = currentValue.slice(0, cursorPos) + '@' + currentValue.slice(cursorPos);
    setCommentMessage(newValue);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(cursorPos + 1, cursorPos + 1);
      const inputEvent = new Event('keydown', { bubbles: true });
      el.dispatchEvent(inputEvent);
    }, 0);
  };

  if (!user) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(styles['comment__input-view'], className)}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(e) => {
        if (preserveSelection) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div
        onMouseDown={(e) => {
          if (preserveSelection) {
            e.stopPropagation();
          }
        }}
      >
        {/* Временно показываем MentionsInput для всех пользователей */}
        <MentionsInput
          inputRef={inputRef}
          value={commentMessage}
          style={isLast ? { ...mentionInputStyles, suggestions: {
            ...mentionInputStyles.suggestions,
            list: {
              ...mentionInputStyles.suggestions.list,
              bottom: "calc(100% + 20px)"
            }
          }} : mentionInputStyles}
          placeholder='Add a comment...'
          onChange={(e) => setCommentMessage(e.target.value)}
          onFocus={(e) => {
            if (preserveSelection) {
              e.preventDefault();
            }
          }}
        >
          <Mention
            data={unitMembersQueryResult.data ?? []}
            trigger={'@'}
            style={mentionStyles}
            markup=',!__display__,!'
          />
        </MentionsInput>
      </div>
      <div className={styles['input__bottom']}>
        {/* Кнопка @ отображается для всех пользователей */}
        <button
          className={styles['mention__button']}
          type='button'
          onClick={() => {
            insertMentionTrigger();
            if (!preserveSelection) {
              inputRef.current?.focus();
            }
          }}
          style={{ border: '2px solid red' }} // Временная отладочная рамка
        >
          <MentionIcon />
        </button>
        <button
          type='submit'
          className={styles['comment-button']}
          disabled={commentMessage.length === 0}
        >
          <ArrowIcon className={styles['comment-button__icon']} />
        </button>
      </div>
    </form>
  );
};

export default CommentsInput;
