import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as Document } from '@images/document.svg';
import { useState, useDeferredValue, useMemo } from 'react';
import useInsertMention from '@app/hooks/editor/useInsertMention';
import SearchInput from '@shared/common/input/SearchInput';
import { Unit } from '@entities/models/unit';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';
import { useParams } from 'react-router-dom';

const TYPE = BlockType.MentionDocument;

interface DocModuleProps {
  toggleSecondMenu: (name: string) => void;
}

const MentionDocumentModule = ({ toggleSecondMenu }: DocModuleProps) => {
  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    toggleSecondMenu(TYPE);
  };

  return (
    <div
      onClick={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <Document className='[&>path]:stroke-text40' />
      Doc
    </div>
  );
};

interface MenuProps {
  menu: string | null;
  callback: () => void;
}

const MentionDocumentMenu = ({
  menu,
  editorState,
  setEditorState,
  callback,
}: MenuProps & EditorProps) => {
  const { documentId } = useParams<{ documentId: string }>();
  const [searchValue, setSearchValue] = useState<string>('');
  const deferredFilter = useDeferredValue(searchValue);
  const { units } = useUnitsContext();
  const { insertMentionBlock } = useInsertMention(editorState, setEditorState);

  const groupedItems = useMemo(() => {
    const channels = units.filter((item) => item.type === 'channel');
    const documents = units.filter((item) => item.type === 'document');
    const filteredDocuments = documents.filter((doc) =>
      doc.name.toLowerCase().includes(deferredFilter.toLowerCase()),
    );
    const getAllDocuments = (parentId: string): Unit[] => {
      return filteredDocuments
        .filter((doc) => doc.parentUnit?.id === parentId)
        .map(item => ({ ...item, documents: getAllDocuments(item.id) }))
    };
    return channels
      .map((channel) => ({
        ...channel,
        documents: getAllDocuments(channel.id),
      }))
      .filter((channel) => channel.documents.length > 0);
  }, [units, deferredFilter, documentId]);

  const handleInsertDocument = (document: Unit) => {
    callback();

    insertMentionBlock({
      url: `/workspace/${document.id}`,
      text: document.name,
      type: TYPE,
    });
  };

  if (menu !== TYPE) return null;

  return (
    <div className='secondMenu flex flex-col'>
      <div className='sticky top-0 bg-white z-10'>
        <SearchInput
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder='Doc name'
        />
      </div>
      <div className='overflow-y-auto flex-1'>
        {groupedItems.length > 0 && (
          <>
            {groupedItems.map((channel) => (
              <div key={channel.id}>
                <div className='font-medium text-text40 text-xs2 mb-0.5 mt-2 uppercase'>
                  {channel.name}
                </div>
                {getDocumentsList(channel.documents, documentId, handleInsertDocument, 0)}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const getDocumentsList = (documents: Unit[] | undefined, documentId: string | undefined, handleInsertDocument: (doc: Unit) => void, level: number) => {
  return documents?.length ? (
    <ul className='space-y-0.'>
      {documents.map((document) => (
        <>
          <li
            key={document.id}
            className='p-2 text-sm3l cursor-pointer rounded-lg text-text70 hover:bg-background hover:text-text flex items-center gap-2'
            onMouseDown={() => handleInsertDocument(document)}
            style={{
              marginLeft: 16*level,
              ...(document.id === documentId ? { opacity: 0.4, pointerEvents: "none" } : {})
            }}
          >
            <Document className='[&>path]:stroke-text40' />
            {document.name}
          </li>
          {getDocumentsList(document.documents, documentId, handleInsertDocument, level + 1)}
        </>
      ))}
    </ul>
  ) : null;
}

MentionDocumentModule.Menu = MentionDocumentMenu;

export default MentionDocumentModule;
