import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as Whiteboard } from '@images/whiteboard.svg';
import { useState, useDeferredValue, useMemo } from 'react';
import useInsertMention from '@app/hooks/editor/useInsertMention';
import SearchInput from '@shared/common/input/SearchInput';
import { Unit } from '@entities/models/unit';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';

const TYPE = BlockType.MentionWhiteboard;

interface WhiteboardModuleProps {
  toggleSecondMenu: (name: string) => void;
}

const MentionWhiteboardModule = ({ toggleSecondMenu }: WhiteboardModuleProps) => {
  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    toggleSecondMenu(TYPE);
  };

  return (
    <div
      onClick={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <Whiteboard className='[&>path]:stroke-text40' />
      Whiteboard
    </div>
  );
};

interface MenuProps {
  menu: string | null;
  callback: () => void;
}

const MentionWhiteboardMenu = ({ menu, editorState, setEditorState, callback }: MenuProps & EditorProps) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const deferredFilter = useDeferredValue(searchValue);
  const { units } = useUnitsContext();
  const { insertMentionBlock } = useInsertMention(editorState, setEditorState);

  const groupedItems = useMemo(() => {
    const channels = units.filter((item) => item.type === 'channel');
    const whiteboards = units.filter((item) => item.type === 'whiteboard');
    const filteredWhiteboards = whiteboards.filter((whiteboard) =>
      whiteboard.name.toLowerCase().includes(deferredFilter.toLowerCase()),
    );
    return channels
      .map((channel) => ({
        ...channel,
        whiteboards: filteredWhiteboards.filter((whiteboard) => whiteboard.parentUnit?.id === channel.id),
      }))
      .filter((channel) => channel.whiteboards.length > 0);
  }, [units, deferredFilter]);

  const handleInsertWhiteboard = (whiteboard: Unit) => {
    callback();

    insertMentionBlock({
      type: TYPE,
      text: whiteboard.name,
      url: `/workspace/${whiteboard.id}`,
    });
  };

  if (menu !== TYPE) return null;

  return (
    <div className='secondMenu flex flex-col'>
      <div className='sticky top-0 bg-white z-10'>
        <SearchInput
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder='Whiteboard name'
        />
      </div>
      <div className='overflow-y-auto flex-1'>
        {groupedItems.length > 0 && (
          <>
            {groupedItems.map((channel) => (
              <div key={channel.id}>
                <div className='font-medium text-text40 text-xs2 mb-0.5 mt-2 uppercase'>{channel.name}</div>
                <ul className='space-y-0.'>
                  {channel.whiteboards.map((whiteboard) => (
                    <li
                      key={whiteboard.id}
                      className='p-2 text-sm3l cursor-pointer rounded-lg text-text70 hover:bg-background hover:text-text flex items-center gap-2'
                      onMouseDown={() => handleInsertWhiteboard(whiteboard)}
                    >
                      <Whiteboard className='[&>path]:stroke-text40' />
                      {whiteboard.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

MentionWhiteboardModule.Menu = MentionWhiteboardMenu;

export default MentionWhiteboardModule;
