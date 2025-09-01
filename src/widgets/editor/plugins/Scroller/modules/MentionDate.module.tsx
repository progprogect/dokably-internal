import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as CalendarIcon } from '@images/calendar.svg';
import { useState } from 'react';
import Calendar from '@shared/uikit/calendar';
import useInsertMention from '@app/hooks/editor/useInsertMention';

// Добавляем константу для типа entity
const ENTITY_TYPE = 'mention-date';
const TYPE = BlockType.MentionDate;

interface DateModuleProps {
  toggleSecondMenu: (name: string) => void;
}

const MentionDateModule = ({ toggleSecondMenu }: DateModuleProps) => {
  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    toggleSecondMenu(TYPE);
  };

  return (
    <div
      onClick={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded pointer-events-auto'
    >
      <CalendarIcon className='[&>path]:stroke-text40' />
      Date
    </div>
  );
};

interface DateMenuProps {
  menu: string | null;
  callback: () => void;
}

const DateMenu = ({
  menu,
  editorState,
  setEditorState,
  callback,
}: DateMenuProps & EditorProps) => {
  const { insertMentionBlock } = useInsertMention(editorState, setEditorState);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    callback();
    
    insertMentionBlock({ text: formattedDate, type: TYPE });
  };

  if (menu !== TYPE) return null;

  return (
    <div className='pointer-events-auto'>
      <Calendar
        selectedDate={selectedDate}
        onSelect={handleDateChange}
      />
    </div>
  );
};

MentionDateModule.Menu = DateMenu;

export default MentionDateModule;