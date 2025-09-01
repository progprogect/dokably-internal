import { Unit } from '@entities/models/unit';
import { useDocumentActionList } from './document-action-list/useDocumentActionList';
import { useChannelActionList } from './channel-action-list/useChannelActionList';
import { useWhiteboardActionList } from './whiteboard-action-list/useWhiteboardActionList';
import { UnitActionListProps } from './props';

export const useUnitActionList = ({ unit, callback }: UnitActionListProps) => {
  const documentActionListJSX = useDocumentActionList({ unit, callback });
  const channelActionListJSX = useChannelActionList({ unit, callback });
  const whiteboardActionListJSX = useWhiteboardActionList({ unit, callback });

  // Safe check for unit existence
  if (!unit) return null;

  if (unit.type === 'whiteboard') {
    return whiteboardActionListJSX;
  }
  if (unit.type === 'document') {
    return documentActionListJSX;
  }
  if (unit.type === 'channel') {
    return channelActionListJSX;
  }

  return null;
};
