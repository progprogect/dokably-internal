import React, { useState, ChangeEvent, MouseEvent, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import cn from 'classnames';

import { OPTION_COLORS } from '@app/constants/table';
import { Option } from '@widgets/editor/plugins/blocks/Table/Table.types';
import { ReactComponent as Flag } from '@icons/flag.svg';

import style from './style.module.scss';

interface Props {
  value: string | null;
  updateValue: (value: Option | null) => void;
  option: Option;
  allOptions: Option[];
  updateOptions: (options: Option[]) => void;
  onClose: () => void;
}

export const OptionMenu = ({ option, updateOptions, updateValue, allOptions, value, onClose }: Props) => {
  const [currentOption, setCurrentOption] = useState<Option>(option);
  const inputRef = React.createRef<HTMLInputElement>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLabelChange = (e: ChangeEvent<HTMLInputElement>) => {
    const label = e.target.value;

    setCurrentOption((prev) => ({ ...prev, label }));
  };

  const handleColorChange = (e: MouseEvent<HTMLDivElement>, color: string) => {
    e.stopPropagation();

    setCurrentOption((prev) => ({ ...prev, color }));
  };

  const handleClose = () => {
    onClose();
  };

  const handleSave = useCallback(() => {
    const newOptions = allOptions.map((item) => (item.id === currentOption.id ? currentOption : item));

    updateOptions(newOptions);

    onClose();
  }, [allOptions, currentOption, onClose, updateOptions]);

  const handleDelete = useCallback(() => {
    if (value === option.id) {
      updateValue(null);
    }
    updateOptions(allOptions.filter((item) => item.id !== currentOption.id));

    onClose();
  }, [allOptions, currentOption.id, onClose, option.id, updateOptions, updateValue, value]);

  const handleKeyDown = useCallback(
    (e: { key: string }) => {
      if (e.key === 'Enter') {
        handleSave();
      }
    },
    [handleSave],
  );

  return (
    <>
      {ReactDOM.createPortal(
        <div
          className={style.overlay}
          onClick={handleClose}
        />,
        document.body,
      )}
      <div
        className={style.menu}
        contentEditable={false}
        tabIndex={-1}
        role='none'
      >
        <div className={style.inputContainer}>
          <input
            className={cn(style.input, style.activeInput)}
            defaultValue={option?.label}
            onKeyDown={handleKeyDown}
            onChange={handleLabelChange}
            onClick={(e) => e.stopPropagation()}
            ref={inputRef}
          />
          <Flag
            className={style.flag}
            fill={currentOption.color}
            stroke={currentOption.color === '#FFFFFF' ? '#D4D4D5' : currentOption.color}
          />
        </div>
        <div className={style.colorContainer}>
          {OPTION_COLORS.map((color) => (
            <div
              key={color}
              className={cn(style.color, {
                [style.selected]: color === currentOption.color,
              })}
              style={{
                backgroundColor: color,
                borderColor: color === '#FFFFFF' ? '#D4D4D5' : color,
              }}
              onClick={(e) => {
                handleColorChange(e, color);
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
            onClick={handleSave}
          >
            <span>Save</span>
          </button>
        </div>
        <button
          className={style.delete}
          onClick={handleDelete}
        >
          <span>Delete</span>
        </button>
      </div>
    </>
  );
};
