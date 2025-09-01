import React, { useCallback, useState, MouseEvent, KeyboardEvent, ChangeEvent, useRef, useEffect } from 'react';

import { Check, MoreVertical } from 'lucide-react';
import cn from 'classnames';
import { OptionMenu } from './OptionMenu';
import { Avatar, AvatarFallback } from '@shared/uikit/avatar';

import style from './style.module.scss';
import { OPTION_COLORS } from '@app/constants/table';
import { Option } from '@widgets/editor/plugins/blocks/Table/Table.types';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import { v4 as uuid } from 'uuid';
import { getInitials } from '@app/utils/get-initials';

interface Props {
  value: Option[] | null;
  updateValue: (value: Option[]) => void;
  options: Option[];
  updateOptions: (value: Option[]) => void;
  hideSearch?: boolean;
  hideMoreButton?: boolean;
  showAvatar?: boolean;
}

export const SelectMenu = ({ value, updateValue, options, updateOptions, hideSearch, hideMoreButton, showAvatar }: Props) => {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedColor, setSelectedColor] = useState('#A9A9AB');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  }, [inputRef]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handelColorClick = (color: string) => {
    setSelectedColor(color);
  };

  const handelKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setInputValue('');
      const updatedOptions = [
        ...options,
        {
          label: inputValue,
          color: selectedColor,
          id: uuid(),
        },
      ];
      updateOptions(updatedOptions);
    }
  };

  const handleOptionClick = useCallback(
    (option: Option) => {
      const updatedValues = value?.find((item) => item.id === option.id)
        ? value?.filter((item) => item.id !== option.id)
        : [...(value || []), option];
      updateValue(updatedValues);
    },
    [updateValue, value],
  );

  const handleClose = useCallback(() => {
    setInputValue('');
    setSelectedColor('#A9A9AB');
  }, []);

  const handleCreate = useCallback(() => {
    const updatedOptions = [
      ...options,
      {
        label: inputValue,
        color: selectedColor,
        id: uuid(),
      },
    ];
    updateOptions(updatedOptions);
    setInputValue('');
    setSelectedColor('#A9A9AB');
  }, [options, inputValue, selectedColor, updateOptions]);

  const handleClickMore = (e: MouseEvent, option: Option) => {
    e.stopPropagation();
    setSelectedOption(option);
  };

  return (
    <div
      className={style.menu}
      contentEditable={false}
      tabIndex={-1}
      role='none'
    >
      {!hideSearch && (
        <input
          placeholder='New selection'
          className={cn(style.input)}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handelKeyDown}
          ref={inputRef}
          tabIndex={-1}
        />
      )}

      {!!inputValue && (
        <div className={style.editContainer}>
          <div className={style.colorContainer}>
            {OPTION_COLORS.map((color) => (
              <div
                key={color}
                className={cn(style.color, color === selectedColor ? style.selected : '')}
                style={{
                  backgroundColor: color,
                  borderColor: color === '#FFFFFF' ? '#D4D4D5' : color,
                }}
                onClick={(e) => {
                  handelColorClick(color);
                  e.stopPropagation();
                }}
              />
            ))}
          </div>
          <div className={style.buttons}>
            <button
              className={style.cancel}
              onClick={handleClose}
            >
              <span>Cancel</span>
            </button>
            <button
              className={style.save}
              onClick={handleCreate}
            >
              <span>Create</span>
            </button>
          </div>
        </div>
      )}
      <div className={style.optionsContainer}>
        {options?.map((option) => (
          <Popover
            key={option.id}
            open={selectedOption?.id === option.id}
          >
            <div
              className={style.option}
              onClick={() => handleOptionClick(option)}
            >
              <span
                className={style.status}
                style={{
                  backgroundColor: option.color,
                  color: option.color === '#FFFFFF' ? '#A9A9AB' : '#FFFFFF',
                  borderColor: option.color === '#FFFFFF' ? '#A9A9AB' : option.color,
                }}
              >
                {showAvatar && (
                  <Avatar>
                    <AvatarFallback className='text-[8px] rounded-md bg-[#6598FF] text-white'>
                      {getInitials(option.label ?? option.email ?? '')}
                    </AvatarFallback>
                  </Avatar>
                )}
                {option.label}
              </span>
              {value?.find((value) => value.id === option.id) && (
                <Check
                  className={style.check}
                  size={16}
                />
              )}
              {!hideMoreButton && (
                <PopoverTrigger onClick={(e) => handleClickMore(e, option)}>
                  <button className={style.more}>
                    <MoreVertical size={16} />
                  </button>
                </PopoverTrigger>
              )}
            </div>
            <PopoverContent
              portal
              autoFocusContent={false}
              side='bottom'
              align='start'
            >
              {selectedOption && (
                <OptionMenu
                  option={selectedOption}
                  allOptions={options}
                  updateOptions={updateOptions}
                  onClose={() => setSelectedOption(null)}
                />
              )}
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </div>
  );
};
