import React from 'react';
import cn from 'classnames';

import { ReactComponent as Search } from '../../images/search.svg';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ className, ...rest }) => {
  return (
    <div className='relative'>
      <div className='flex absolute inset-y-0 left-0 items-center pl-2 pointer-events-none'>
        <Search className='opacity-40' />
      </div>
      <input
        {...rest}
        type='search'
        className={cn(
          ' rounded-lg w-full border-text20 border-solid border focus:outline-none text-sm3l p-2 pl-8 text-text40 focus:text-text',
          className,
        )}
      />
    </div>
  );
};

export default SearchInput;
