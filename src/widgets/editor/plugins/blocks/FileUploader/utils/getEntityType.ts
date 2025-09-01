import { ContentState } from 'draft-js';

export function getEntityType(
  contentState: ContentState,
  entityKey: string | null,
): null | string {
  if (!entityKey) return null;
  return contentState.getEntity(entityKey).getType();
}
