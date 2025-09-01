import Button from '@shared/common/Button';
import React, { KeyboardEventHandler, useRef, useState } from 'react';
import cn from 'classnames';

import { ReactComponent as Edit } from '@images/edit.svg';
import { ReactComponent as Check } from '@images/checkOriginal.svg';
import { validateAndAddURLScheme } from './utils';

type ValidationOptions = 'url';

interface EditLinkPanelProps {
  className?: string;
  name?: string;
  value?: string;
  validateAs?: ValidationOptions;
  onEdit?: (url: string) => void;
  onDelete?: (event: React.UIEvent) => void;
}

export const EditLinkPanel: React.FC<EditLinkPanelProps> = (props) => {
  const [link, setLink] = useState<string>(props.value ?? '');
  const [error, setError] = useState<string>('');
  const wrapperRef = useRef<HTMLFormElement>(null);

  const [isEdit, setEdit] = useState(false);
  const switchToEditMode = () => setEdit(true);

  const submitEdit = (event?: React.FormEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!wrapperRef.current) return;
    let testedLink;
    try {
      testedLink = validateAndAddURLScheme(link)
    } catch (error) {
      setError('Please enter a valid link')
      return
    }

    if (props.onEdit && !!testedLink) {
      props.onEdit(testedLink);
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      submitEdit()
    }
  }

  const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const value: string = e.currentTarget.value;
    setLink(value);
  };

  const handleDeleteLink = (event: React.UIEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (props.onDelete) {
      props.onDelete(event);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    let paste = e.clipboardData.getData('text');

    if (paste) {
      setError('')
      setLink(paste);
    }
  };

  return (
    <div className='w-80 relative z-0' contentEditable={false}>
      {!isEdit && (
        <a
          href={link}
          target='_blank'
          rel='noopener noreferrer'
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          className={cn(
            'rounded',
            'h-full',
            'absolute z-10 bg-white',
            'w-full',
            'border',
            'border-solid',
            'border-text10',
            'text-sm',
            'py-2.5',
            'px-4',
            'pt-3',
            'pr-20',
            'underline',
            'cursor-pointer',
            'text-fontBlue'
          )}
        >
          {link}
        </a>
      )}
      <form
        className='relative flex'
        ref={wrapperRef}
        onSubmit={submitEdit}
        contentEditable={false}
        autoComplete='off'
      >
        <input
          name={props.name ?? 'link_edit_input'}
          type={props.validateAs === 'url' ? 'url' : 'text'}
          placeholder='Paste link here'
          contentEditable={false}
          autoComplete='off'
          className={cn(
            'rounded',
            'w-full',
            'border',
            'border-solid',
            'border-text10',
            'text-sm',
            'py-2.5',
            'px-4',
            'pr-20',
            'hover:border-text20',
            'focus-visible:border-text20',
            'focus:outline-none',
            'disabled:bg-text5',
            'disabled:text-text40',
            'valid:text-fontBlue',
            'invalid:text-fontRed',
            props.className,
            {'!text-fontRed': !!error}
          )}
          onChange={handleURLChange}
          onPaste={handlePaste}
          value={link}
          onKeyDown={handleKeyDown}
        />
      </form>

      <div className='absolute z-20 right-0 top-0 h-full flex'>
        <Button
          iconOnly
          icon={
            isEdit ? (
            <Check className={cn('[&>path]:stroke-text60 [&>path:last-child]:fill-text60', '[&>path]:hover:stroke-text')} />
            ) : (
                <Edit className={cn('[&>path]:stroke-text60 [&>path:last-child]:fill-text60', '[&>path]:hover:stroke-text')} />
            )}
          label=''
          title={isEdit ? 'Apply changes' : 'Edit link'}
          styleType='input-text'
          onClick={isEdit ? submitEdit : switchToEditMode}
          className={cn(
            'py-1',
            'w-9'
          )}
          disabled={!link || !!error}
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
