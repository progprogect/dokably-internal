import React, { useCallback, useState, MouseEvent, KeyboardEvent, ChangeEvent } from 'react';

import { Check, MoreVertical } from 'lucide-react';
import cn from 'classnames';
import { OptionMenu } from './OptionMenu';

import style from './style.module.scss';
import { OPTION_COLORS } from '@app/constants/table';
import { Option } from '@widgets/editor/plugins/blocks/Table/Table.types';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/uikit/popover';
import { ReactComponent as Flag } from '@icons/flag.svg';
import { v4 as uuid } from 'uuid';

interface Props {
  value: string | null;
  updateValue: (value: Option | null) => void;
  options: Option[];
  updateOptions: (options: Option[]) => void;
}

export const PriorityMenu = ({ value, updateValue, options, updateOptions }: Props) => {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const [inputValue, setInputValue] = useState('');
  const [selectedColor, setSelectedColor] = useState('#A9A9AB');

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handelColorClick = (color: string) => {
    setSelectedColor(color);
  };

  const handelKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setInputValue('');
      updateOptions([
        ...options,
        {
          label: inputValue,
          color: selectedColor,
          id: uuid(),
        },
      ]);
    }
  };

  const handleOptionClick = useCallback(
    (option: Option) => {
      if (option.id === value) {
        updateValue(null);
      } else {
        updateValue(option);
      }
    },
    [value, updateValue],
  );

  const handleClose = useCallback(() => {
    setInputValue('');
    setSelectedColor('#A9A9AB');
  }, []);

  const handleCreate = useCallback(() => {
    updateOptions([
      ...options,
      {
        label: inputValue,
        color: selectedColor,
        id: uuid(),
      },
    ]);
    setInputValue('');
    setSelectedColor('#A9A9AB');
  }, [updateOptions, options, inputValue, selectedColor]);

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
      <div className={style.inputContainer}>
        <input
          placeholder='New priority'
          className={cn(style.input, {
            [style.activeInput]: !!inputValue,
          })}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handelKeyDown}
          tabIndex={-1}
        />
        {!!inputValue && (
          <Flag
            className={style.flag}
            fill={selectedColor}
            stroke={selectedColor === '#FFFFFF' ? '#D4D4D5' : selectedColor}
          />
        )}
      </div>
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
              <Flag
                stroke={option.color === '#FFFFFF' ? '#A9A9AB' : option.color}
                fill={option.color}
              />
              <span className={style.optionText}>{option.label}</span>
              {value === option.id && (
                <Check
                  className={style.check}
                  size={16}
                />
              )}
              <PopoverTrigger onClick={(e) => handleClickMore(e, option)}>
                <button className={style.more}>
                  <MoreVertical size={16} />
                </button>
              </PopoverTrigger>
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
                  updateValue={updateValue}
                  value={value}
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
