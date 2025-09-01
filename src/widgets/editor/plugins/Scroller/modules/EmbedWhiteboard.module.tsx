import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as Whiteboard } from '@images/whiteboard.svg';
import { useState, useDeferredValue, useMemo } from 'react';
import SearchInput from '@shared/common/input/SearchInput';
import { Unit } from '@entities/models/unit';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';
import { EditorState } from 'draft-js';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import useInlineStyles from '@app/hooks/editor/useInlineStyles';
import { createWhiteboard } from '@app/services/whiteboard.service';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const TYPE = BlockType.EmbedWhiteboard;

interface WhiteboardModuleProps {
  toggleSecondMenu: (name: string) => void;
}

const EmbedWhiteboardModule = ({ toggleSecondMenu }: WhiteboardModuleProps) => {
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

const EmbedWhiteboardMenu = ({
  menu,
  setEditorState,
  callback,
}: MenuProps & EditorProps) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const deferredFilter = useDeferredValue(searchValue);
  const { units } = useUnitsContext();
  const navigate = useNavigate();
  const { addUnit } = useUnitsContext();

  const groupedItems = useMemo(() => {
    const channels = units.filter((item) => item.type === 'channel');
    const whiteboards = units.filter((item) => item.type === 'whiteboard');
    const filteredWhiteboards = whiteboards.filter((whiteboard) =>
      whiteboard.name.toLowerCase().includes(deferredFilter.toLowerCase()),
    );
    return channels
      .map((channel) => ({
        ...channel,
        whiteboards: filteredWhiteboards.filter(
          (whiteboard) => whiteboard.parentUnit?.id === channel.id,
        ),
      }))
      .filter((channel) => channel.whiteboards.length > 0);
  }, [units, deferredFilter]);

  const handleInsertWhiteboard = (whiteboard: Unit) => {
    const { addEmbedBlock } = useBlockTypes();
    const { removeAllInlineStyles } = useInlineStyles();

    setEditorState((editorState: EditorState) => {
      editorState.getCurrentContent;
      editorState = removeAllInlineStyles(editorState);
      editorState = addEmbedBlock(
        editorState,
        TYPE,
        whiteboard.name,
        `/workspace/${whiteboard.id}`,
      );
      return editorState;
    });
    callback();
  };

  const handleCreateWhiteboard = async () => {
    const defaultChannel = units.find(
      (unit) => unit.type === 'channel' && unit.isDefault,
    );
    if (!defaultChannel) {
      console.error('Default channel not found');
      return;
    }
    const newWhiteboard = await createWhiteboard(defaultChannel.id, uuidv4());
    if (newWhiteboard) {
      handleInsertWhiteboard(newWhiteboard);
      setTimeout(() => {
        addUnit(newWhiteboard);
        navigate(`/workspace/${newWhiteboard.id}`);
      }, 1000);
    }
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
        <button
          className='p-2  w-full text-sm3l cursor-pointer rounded-lg text-text70 hover:bg-background flex items-center gap-2 my-0.5'
          onMouseDown={handleCreateWhiteboard}
        >
          <Plus className='[&>path]:stroke-text40' />
          Create new whiteboard
        </button>
      </div>
      <div className='overflow-y-auto flex-1'>
        {groupedItems.length > 0 && (
          <>
            {groupedItems.map((channel) => (
              <div key={channel.id}>
                <div className='font-medium text-text40 text-xs2 mb-0.5 mt-2 uppercase'>
                  {channel.name}
                </div>
                <ul className='space-y-0.'>
                  {channel.whiteboards.map((whiteboard) => (
                    <li
                      key={whiteboard.id}
                      className='p-2 text-sm3l cursor-pointer rounded-lg text-text70 hover:bg-background flex items-center gap-2'
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

EmbedWhiteboardModule.Menu = EmbedWhiteboardMenu;

export default EmbedWhiteboardModule;
