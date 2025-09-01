import { ReactComponent as CommentIcon } from '@icons/comments-icon.svg';
import { Comment as CommentModel } from '@entities/models/Comment';
import CommentView from '@widgets/comment-view';
import styles from './styles.module.scss';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import { cn } from '@app/utils/cn';
import { getMembersForUnit } from '@app/services/share.service';
import { selectMembersForSuggestions } from '@app/queries/unit/members/selectors/selectMembersForSuggestions';
import _ from 'lodash';
import { useGetUnitMembersQuery } from '@app/queries/unit/members/useGetUnitMembersQuery';
import { useParams } from 'react-router-dom';

interface CommentsInfoProps {
  count: number;
  comments: CommentModel[];
  onDelete: (id: string) => void;
  onReply: (id: string, message: string) => void;
  onReplyDelete: (id: string, replyId: string) => void;
}

const CommentsInfo = ({
  count,
  comments,
  onDelete,
  onReply,
  onReplyDelete,
}: CommentsInfoProps) => {
  const { documentId } = useParams();
  const unitMembersQueryResult = useGetUnitMembersQuery({ unitId: documentId }, getMembersForUnit, {
    enabled: !_.isNil(documentId),
    select: selectMembersForSuggestions,
  });




  return (
    <div contentEditable={false}>
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn('icon-button', styles['comments-info'])}>
            <CommentIcon />
            <div className={styles['comments-info__count']}>{count}</div>
          </button>
        </PopoverTrigger>
        <PopoverContent
          portal
          align='end'
        >
          <div className={styles['comments-info__view']}>
            {comments.map((item, index) => (
              <CommentView
                key={item.id}
                comment={item}
                onDelete={onDelete}
                onReply={onReply}
                onReplyDelete={onReplyDelete}
                replies={item.replies}
                id={item.id}
                autofocus={false}
                unitMembersQueryResultData={unitMembersQueryResult?.data ?? []}
                type='editor'
                isLast={index === comments.length - 1}
              />
            ))}
            <div className={styles['comments-info__view-border']}></div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CommentsInfo;
