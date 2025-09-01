import { ContentState } from 'draft-js';

export function getBlockEntityData<D>(
  contentState: ContentState,
  entityKey: string | null,
): D | null {
  if (!entityKey) return null;
  const data = contentState.getEntity(entityKey).getData();
  return data.metadata;
}
