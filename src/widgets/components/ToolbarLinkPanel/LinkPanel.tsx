import InputWithButton from '@shared/common/input/InputWithButton';
import React, { useState } from 'react';
import cn from 'classnames';
import { validateAndAddURLScheme } from './utils';

interface LinkPanelProps {
  onApply: (link: string) => void;
  autoFocus?: boolean;
}

export const LinkPanel: React.FC<LinkPanelProps> = ({ onApply = () => {}, autoFocus = true }) => {
  const [error, setError] = useState<string>('');
  const onButtonClick = (url: string) => {
    let testedLink;
    try {
      testedLink = validateAndAddURLScheme(url)
    } catch (error) {
      setError('Please enter a valid link')
      return
    }
    if (!!error) return;
    if (!!testedLink) {
      onApply(testedLink);
    }
  };

  const handleChange = () => {
    if (!!error) {
      setError('')
      return;
    }
  }

  return (
    <div className='w-80' contentEditable={false}>
      <div onMouseDown={(e) => {
        if (!autoFocus) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}>
        <InputWithButton
          name='link_title'
          placeholder='Paste link here'
          // validateAs='url'
          onButtonClick={onButtonClick}
          onChange={handleChange}
          className={cn({'!text-fontRed': !!error})}
          autoFocus={autoFocus}
        />
      </div>
      {!!error && (<div
        className={cn(
          'absolute',
          'top-10',
          'flex',
          'justify-center',
          'shadow-md',
          'rounded',
          'text-errorText text-sm',
          'p-1 px-2',
          'z-0',
          'bg-white',
        )}
      >{error}</div>)}
    </div>
  );
};
