import { ContentState } from 'draft-js';

export function getEntityType(contentState: ContentState, entityKey: string | null): string | null {
  if (!entityKey) return null;
  try {
    const entity = contentState.getEntity(entityKey);
    return entity.getType();
  } catch {
    return null;
  }
}
