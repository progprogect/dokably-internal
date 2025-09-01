import BlockType from '@entities/enums/BlockType';
import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as User } from '@images/user.svg';
import { useState, useDeferredValue, useMemo } from 'react';

import useInsertMention from '@app/hooks/editor/useInsertMention';
import SearchInput from '@shared/common/input/SearchInput';
import { useWorkspaceContext } from '@app/context/workspace/context';

const TYPE = BlockType.MentionPerson;

interface PersonModuleProps {
  toggleSecondMenu: (name: string) => void;
}

const MentionPersonModule = ({ toggleSecondMenu }: PersonModuleProps) => {
  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    toggleSecondMenu(TYPE);
  };

  return (
    <div
      onClick={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <User className='[&>path]:stroke-text40' />
      Person
    </div>
  );
};

interface MenuProps {
  menu: string | null;
  callback: () => void;
}

const MentionPersonMenu = ({ menu, editorState, setEditorState, callback }: MenuProps & EditorProps) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const deferredFilter = useDeferredValue(searchValue);
  const { activeMembers: members, activeGuests: guests } = useWorkspaceContext();

  const filteredMembers = useMemo(
    () =>
      [...members, ...guests]?.filter((member) => {
        if (!deferredFilter) return true;
        return member.user.name
          ? member.user.name?.toLowerCase().includes(deferredFilter.toLowerCase())
          : member.user.email.toLowerCase().includes(deferredFilter.toLowerCase());
      }),
    [members, guests, deferredFilter],
  );

  const { insertMentionBlock } = useInsertMention(editorState, setEditorState);

  const handleSelectMember = (event: React.MouseEvent<HTMLLIElement>, name: string) => {
    event.preventDefault();
    callback();

    insertMentionBlock({ type: TYPE, text: `@${name}` });
  };

  if (menu !== TYPE) return null;

  return (
    <div className='secondMenu'>
      <SearchInput
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder='User name'
      />
      {members && members.length > 0 && (
        <>
          <div className='font-medium text-text40 text-xs2 mb-0.5 mt-2 uppercase'>People</div>
          <ul className='space-y-0.'>
            {filteredMembers?.map((member) => (
              <li
                key={member.user.id}
                className='p-2 text-sm3l cursor-pointer rounded-lg text-text70 hover:bg-background hover:text-text'
                onMouseDown={(event) => {
                  handleSelectMember(event, member.user.name || member.user.email);
                }}
              >
                {member.user.name || member.user.email}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

MentionPersonModule.Menu = MentionPersonMenu;

export default MentionPersonModule;
