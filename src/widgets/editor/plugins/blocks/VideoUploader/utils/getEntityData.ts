import { ContentState } from 'draft-js';

export function getEntityData<T>(contentState: ContentState, entityKey: string | null): T | null {
  if (!entityKey) return null;
  try {
    const entity = contentState.getEntity(entityKey);
    return entity.getData()?.metadata || null;
  } catch {
    return null;
  }
}
