import React, { useState, ChangeEvent, MouseEvent, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import cn from 'classnames';

import { OPTION_COLORS } from '@app/constants/table';
import { Option } from '@widgets/editor/plugins/blocks/Table/Table.types';

import style from './style.module.scss';

interface Props {
  option: Option;
  allOptions: Option[];
  updateOptions: (options: Option[]) => void;
  onClose: () => void;
}

export const OptionMenu = ({
  option,
  allOptions,
  updateOptions,
  onClose,
}: Props) => {
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
      <div className={style.menu}>
        <input
          className={style.input}
          defaultValue={option?.label}
          onKeyDown={handleKeyDown}
          onChange={handleLabelChange}
          onClick={(e) => e.stopPropagation()}
          ref={inputRef}
        />
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
      </div>
    </>
  );
};
