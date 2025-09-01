import { IDocument } from '@entities/models/IDocument';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

const DOCUMENT_INITIAL_DATA: IDocument = { state: null, items: [] };

const getDocumentQueryKey = (props: {
  documentId: string | undefined;
}): string[] => {
  const key = ['document'];
  if (!_.isNil(props.documentId)) key.push(props.documentId);
  return key;
};

export const useGetDocumentQuery = (
  props: { documentId: string | undefined },
  fetcher: (
    documentId: string,
    options?: { signal?: AbortSignal },
  ) => Promise<IDocument>,
  options?: { enabled?: boolean },
) => {
  const query = useQuery<IDocument, Error, IDocument, string[]>({
    queryKey: getDocumentQueryKey(props),
    queryFn: (options) => {
      if (!props.documentId) return DOCUMENT_INITIAL_DATA;
      return fetcher(props.documentId, options);
    },
    enabled: options?.enabled,
    initialData: DOCUMENT_INITIAL_DATA,
  });

  return query;
};
