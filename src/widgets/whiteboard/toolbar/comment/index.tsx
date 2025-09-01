import { useClickOutside } from '@app/hooks/useClickOutside';
import { ReactComponent as CommentIcon } from '@images/comment.svg';

export const Comment = () => {
  const { ref, isVisible, setIsVisible } = useClickOutside(false);

  return (
    <div ref={ref} className='toolbar-item'>
      <CommentIcon />
    </div>
  );
};

export default Comment;
