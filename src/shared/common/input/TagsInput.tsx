import React, { useEffect } from 'react';
import cn from 'classnames';
import _ from 'lodash';

import { ReactComponent as Close } from '../../images/close.svg';

interface TagsInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className: string;
  onChangeTags: (value: string[]) => void
}

const TagsInput: React.FC<TagsInputProps> = ({ className, onChangeTags, ...rest }) => {
  const [input, setInput] = React.useState('');
  const [tags, setTags] = React.useState<Array<string>>([]);
  const [isKeyReleased, setIsKeyReleased] = React.useState(false);

  const DELIMITER_KEYS = [',', 'Enter', ' '];
  const DELIMITER_REGEX = /[\s,\n]+/;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInput(value);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const { key } = event;
    const trimmedInput = input.trim();

    if (
      DELIMITER_KEYS.includes(key) &&
      trimmedInput.length &&
      !tags.includes(trimmedInput)
    ) {
      event.preventDefault();
      setTags((prevState) => [...prevState, trimmedInput]);
      setInput('');
    }

    if (key === 'Backspace' && !input.length && tags.length && isKeyReleased) {
      const tagsCopy = [...tags];
      const poppedTag = tagsCopy.pop() || '';
      event.preventDefault();
      setTags(tagsCopy);
      setInput(poppedTag);
    }

    setIsKeyReleased(false);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    event.preventDefault();
    const trimmedInput = input.trim();
    const possibleTags = _.chain(trimmedInput).split(DELIMITER_REGEX).filter(Boolean).value();
    if (possibleTags.length) {
      setTags((prevState) => [...prevState, ...possibleTags]);
      setInput('');
    }
  }

  const onKeyUp = () => {
    setIsKeyReleased(true);
  };

  const deleteTag = (index: number) => {
    setTags((prevState) => prevState.filter((tag, i) => i !== index));
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData('text');
    const possibleTags = _.chain(pastedText).split(DELIMITER_REGEX).filter(Boolean).value();
    if (possibleTags.length) {
      setTags((prevState) => [...prevState, ...possibleTags]);
      setInput('');
      event.preventDefault();
    }
  };

  useEffect(() => {
    if (onChangeTags) {
      onChangeTags(tags)
    }
  }, [tags])

  return (
    <div
      className={cn(
        'flex items-center overflow-scroll max-w-full rounded w-full border border-solid border-text10 hover:border-text20 text-sm py-2.75 px-4',
        className
      )}
    >
      {tags.map((tag, index) => (
        <div className='flex items-center mr-3 cursor-default' key={index}>
          {tag}
          <Close
            className='ml-0.75 cursor-pointer [&>g>path]:stroke-1 [&>g>path]:stroke-text50'
            onClick={() => deleteTag(index)}
          />
        </div>
      ))}
      <input
        {...rest}
        className='overflow-scroll h-4 w-full min-w-1/2 focus:outline-none text-sm disabled:bg-text5 disabled:text-text40'
        value={input}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onChange={onChange}
        onBlur={handleBlur}
        onPaste={handlePaste}
      />
    </div>
  );
};

export default TagsInput;
