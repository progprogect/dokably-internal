import { ContentState, EditorState, Modifier, SelectionState } from 'draft-js';
import { useMemo, useState, useEffect, MouseEvent } from 'react';
import { ReactComponent as DocumentIcon } from '@shared/images/document.svg';
import { ReactComponent as TaskIcon } from '@shared/images/task.svg';
import { ReactComponent as TableIcon } from '@shared/images/table.svg';
import { ReactComponent as WhiteboardIcon } from '@shared/images/whiteboard.svg';
import { useNavigate } from 'react-router-dom';
import Calendar from '@shared/uikit/calendar';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';
import BlockType from '@entities/enums/BlockType';

interface MentionBlockProps {
  contentState: ContentState;
  entityKey: string;
  children?: React.ReactNode;
  offsetKey: string;
  decoratedText: string;
  blockKey: string;
  start: number;
  end: number;
  getEditorState: () => EditorState;
  setEditorState: (editorState: EditorState) => void;
}

const getMentionTypeFromEntityType = (entityType: string): BlockType => {
  switch (entityType) {
    case 'mention-date':
      return BlockType.MentionDate;
    case 'mention-document':
      return BlockType.MentionDocument;
    case 'mention-task':
      return BlockType.MentionTask;
    case 'mention-table':
      return BlockType.MentionTable;
    case 'mention-whiteboard':
      return BlockType.MentionWhiteboard;
    case 'mention-person':
      return BlockType.MentionPerson;
    default:
      return BlockType.MentionDate;
  }
};

const MentionBlock = (props: MentionBlockProps) => {
  const { setReadOnly } = useDokablyEditor();
  const { contentState, entityKey, offsetKey, blockKey, start, end, getEditorState, setEditorState, decoratedText } =
    props;

  const [showCalendar, setShowCalendar] = useState(false);
  const [localText, setLocalText] = useState<string>(decoratedText.replace('\u200B', ''));

  const navigate = useNavigate();

  const { url, type } = useMemo(() => {
    const entity = contentState.getEntity(entityKey);
    const entityType = entity.getType();

    const mentionType = getMentionTypeFromEntityType(entityType);

    const data = entity?.getData() as {
      url?: string;
    };

    return {
      type: mentionType,
      url: data.url,
    };
  }, [contentState, entityKey]);

  const handleDateClick = (e: MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();

    setReadOnly(true);
    setShowCalendar(!showCalendar);
  };

  const handleDateSelect = async (date: Date) => {
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    setLocalText(formattedDate);
    setShowCalendar(false);
    
    const editorState = getEditorState();
    const currentContent = editorState.getCurrentContent();

    const targetSelection = SelectionState.createEmpty(blockKey).merge({
      anchorOffset: start,
      focusOffset: end,
    });

    const newContentState = Modifier.replaceText(
      currentContent,
      targetSelection,
      `${formattedDate}\u200B`,
      undefined,
      entityKey,
    );

    const newEditorState = EditorState.push(editorState, newContentState, 'apply-entity');

    setEditorState(newEditorState);

    setReadOnly(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (showCalendar && !(event.target as Element).closest('.calendar-container')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showCalendar]);

  useEffect(() => {
    if (showCalendar) {
      const calendarElement = document.querySelector('.calendar-container .absolute');
      if (calendarElement) {
        const rect = calendarElement.getBoundingClientRect();
        if (rect.bottom > window.innerHeight) {
          calendarElement.classList.add('bottom-full', 'mb-1');
          calendarElement.classList.remove('mt-1');
        } else {
          calendarElement.classList.remove('bottom-full', 'mb-1');
          calendarElement.classList.add('mt-1');
        }
      }
    }
  }, [showCalendar]);

  useEffect(() => {
    if (decoratedText) {
      setLocalText(decoratedText.replace('\u200B', ''));
    }
  }, [decoratedText]);

  const icons = () => {
    switch (type) {
      case BlockType.MentionDocument:
        return <DocumentIcon />;
      case BlockType.MentionTask:
        return <TaskIcon />;
      case BlockType.MentionTable:
        return <TableIcon />;
      case BlockType.MentionWhiteboard:
        return <WhiteboardIcon />;
      default:
        return null;
    }
  };

  const getIcon = () => {
    if (icons()) {
      return <span className='w-4 h-4 -mt-0.5 pt-0.5 mr-1'>{icons()}</span>;
    }
    return null;
  };

  const commonClasses = 'h-[34px] inline-flex p-2 bg-text5 mx-1 rounded-sm';
  const mentionContent = (
    <>
      {getIcon()}
      <span className='text-sml'>{localText}</span>
    </>
  );

  const handleLinkClick = (e: MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    if (!url) return;

    navigate(url);
  };

  if (type === BlockType.MentionDate) {
    return (
      <div className='inline-block calendar-container'>
        <span
          data-offset-key={offsetKey}
          contentEditable={false}
          className={`${commonClasses} cursor-pointer`}
          onMouseDown={handleDateClick}
        >
          {mentionContent}
        </span>
        {showCalendar && (
          <div className='absolute z-50 mt-1'>
            <Calendar
              selectedDate={new Date(localText)}
              onSelect={handleDateSelect}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <span
      data-offset-key={offsetKey}
      contentEditable={false}
      className={`${commonClasses} ${url ? 'cursor-pointer' : 'cursor-default'}`}
      onMouseDown={handleLinkClick}
    >
      {mentionContent}
    </span>
  );
};

export default MentionBlock;
