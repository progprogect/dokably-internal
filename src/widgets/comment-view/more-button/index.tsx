import { MoreHorizontal } from 'lucide-react';
import styles from './styles.module.scss';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';

export interface IMoreButton {
  onDelete: () => void;
}

const MoreButtonCommentsComponent = ({ onDelete }: IMoreButton) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={styles['comment-view__more-button']}>
          <MoreHorizontal
            className={styles['comment-view__more-button-icon']}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align='end'>
        <div className={styles['comment-view__more-button']}>
          <div className={styles['actions-list-comments']}>
            <button
              className={styles['actions-list-comments__item']}
              onMouseDown={onDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MoreButtonCommentsComponent;
