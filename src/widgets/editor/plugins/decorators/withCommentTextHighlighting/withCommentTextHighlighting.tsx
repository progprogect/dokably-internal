import { setSidePanelState } from '@app/redux/features/commentsSidebar';
import {
  ContentBlock,
  ContentState,
  DraftDecorator,
  DraftDecoratorComponentProps,
} from 'draft-js';
import { MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useLocalStorage } from 'usehooks-ts';

import styles from './styles.module.scss';

const findCommentEntities = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState,
) => {
  contentBlock.findEntityRanges((character: any) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'COMMENT'
    );
  }, callback);
};

export const withCommentTextHighlighting: DraftDecorator = {
  strategy: findCommentEntities,
  component: (props: DraftDecoratorComponentProps) => {
    const dispatch = useDispatch();
    const [, setLocalStorageKey] = useLocalStorage('sidePanel', '');

    const handleInlineCommentClick = (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      dispatch(setSidePanelState(true));
      setLocalStorageKey(event.currentTarget.id.toString());
    };
    return (
      <a
        href=''
        className={styles['comments__inline_wrapper']}
        rel='noopener noreferrer'
        entity-key={props.entityKey}
        onMouseDown={handleInlineCommentClick}
        onClick={(e) => e.preventDefault()}
      >
        <span id={props.entityKey}>{props.children}</span>
      </a>
    );
  },
};
