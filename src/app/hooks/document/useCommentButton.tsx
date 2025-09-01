import { ReactComponent as CommentIcon } from '@icons/comment.svg';
import { ReactComponent as CommentIconOpen } from '@icons/comment-open.svg';
import { setSidePanelState } from '@app/redux/features/commentsSidebar';
import { useDispatch, useSelector } from 'react-redux';
import React, { memo, useCallback, useEffect, useState } from 'react';

interface UseCommentButtonReturn {
  isCommentsPanelOpen: boolean;
  CommentButton: React.FC;
}

const useCommentButton = (): UseCommentButtonReturn => {
  const dispatch = useDispatch();
  const sidePanelState = useSelector((state: any) => state.commentsSidebar.sidePanel);
  const [isCommentsPanelOpen, toggleCommentsPanel] = useState<boolean>(false);

  const onCommentsButtonClick = useCallback(() => {
    const e: any = document.getElementsByClassName('comments__inline_wrapper-active');
    for (let i = 0; i < e.length; i++) {
      e[i].className = 'comments__inline_wrapper';
    }
    toggleCommentsPanel((val) => !val);
    dispatch(setSidePanelState(false));
  }, [dispatch]);

  useEffect(() => {
    if (sidePanelState) {
      toggleCommentsPanel(true);
    }
  }, [sidePanelState]);

  const CommentButton: React.FC = memo(() => (
    <button onClick={onCommentsButtonClick}>
      {isCommentsPanelOpen ? (
        <CommentIconOpen className='comment__icon_opened' />
      ) : (
        <CommentIcon className='comment__icon' />
      )}
    </button>
  ));

  return { CommentButton, isCommentsPanelOpen };
};

export default useCommentButton;
