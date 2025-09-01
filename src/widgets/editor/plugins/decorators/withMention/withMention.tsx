import { ContentBlock, ContentState, DraftDecorator, EditorState } from 'draft-js';
import MentionBlock from './MentionBlock';
import BlockType from '@entities/enums/BlockType';

const mentions = [
  BlockType.MentionDate,
  BlockType.MentionDocument,
  BlockType.MentionPerson,
  BlockType.MentionTable,
  BlockType.MentionTask,
  BlockType.MentionWhiteboard,
] as string[];

const findMentionEntities = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState,
) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    if (entityKey === null) return false;

    const entityType = contentState.getEntity(entityKey).getType();

    return mentions.includes(entityType);
  }, callback);
};

export const withMention: DraftDecorator = {
  strategy: findMentionEntities,
  component: (props) => {
    return <MentionBlock {...props} />;
  },
};
