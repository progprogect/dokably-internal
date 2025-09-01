import React, { ChangeEvent, useCallback, useState } from 'react';

import cn from 'classnames';

import cssStyles from './style.module.scss';
import { SuggestionDataItem } from 'react-mentions';
import { Check } from 'lucide-react';

interface Props {
  users: SuggestionDataItem[] | null;
  updateValue: (users: SuggestionDataItem[] | null) => void;
  options: SuggestionDataItem[];
}

export const AssigneePopoverContent = ({ options, users, updateValue }: Props) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const getInitials = (fullName: string): string => {
    const names = fullName.split(' ');
    const initials = names.map((name) => name.charAt(0).toUpperCase()).join('');
    return initials;
  };

  const filteredOptions = options.filter((option) => option.display?.toLowerCase().includes(inputValue.toLowerCase()));

  const handleOptionClick = (option: SuggestionDataItem) => {
    const isUserExist = users !== null && users.find((o) => o.id === option.id);
    if (isUserExist) {
      updateValue(users.filter((o) => o.id !== option.id));
    } else {
      updateValue([...(users ?? []), option]);
    }
  };

  return (
    <div
      className={cssStyles.optionContainer}
      tabIndex={-1}
      role='none'
      contentEditable={false}
    >
      <input
        type='text'
        className={cssStyles.optionInput}
        placeholder='Email or user name'
        value={inputValue}
        onChange={handleInputChange}
        tabIndex={-1}
      />

      {filteredOptions.map((option) =>
        option.display ? (
          <div
            className={cn(cssStyles.option)}
            key={option.id}
            onClick={() => handleOptionClick(option)}
          >
            <span className={cssStyles.avatar}>{getInitials(option.display || '')}</span>
            <span className={cssStyles.name}>{option.display}</span>
            {users?.find((user) => user.id === option.id) && (
              <Check
                size={16}
                className={cssStyles.check}
              />
            )}
          </div>
        ) : null,
      )}
    </div>
  );
};
