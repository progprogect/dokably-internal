import { useClickOutside } from '@app/hooks/useClickOutside';
import { ReactComponent as ArrowUp } from '@images/arrowUp.svg';
import { ReactComponent as Check } from '@images/checkOriginal.svg';
import { ChangeEvent, MouseEventHandler } from 'react';
import cn from 'classnames';
import { track } from '@amplitude/analytics-browser';
import ComingSoon from '@widgets/components/ComingSoon';
import { GuestOptionsMap } from './types';
import Button from '@shared/common/Button';

interface MemberOptionsProps {
  customOptionsMap: GuestOptionsMap;
  selectorName: string;
  isButtonLike?: boolean;
  currentOption: 'guest';
  onSubmit: () => void;
}

function GuestOptions({
  customOptionsMap,
  selectorName,
  isButtonLike,
  currentOption,
  onSubmit,
}: MemberOptionsProps) {
  const optionsMap = customOptionsMap;
  const options = Object.keys(optionsMap) as (keyof typeof optionsMap)[];
  const { ref, isVisible, setIsVisible } = useClickOutside(false);

  const onConfitm: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit();

    closeSelector();
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    closeSelector();
  };

  const openSelector = () => {
    track('document_share_visibility_opened');
    setIsVisible(true);
    ref?.current?.focus();
  };
  const closeSelector = () => {
    setIsVisible(false);
  };
  const CurrentIcon = optionsMap[currentOption].icon;
  const currentTitle = optionsMap[currentOption].title;
  return (
    <div className='relative sharing-selector flex items-center min-w-210'>
      <button
        onClick={openSelector}
        className={cn('flex items-center', {
          'text-sm py-0.8 px-2.51 bg-background font-normal rounded-md whitespace-nowrap h-8.5':
            isButtonLike,
        })}
      >
        {!!CurrentIcon && <CurrentIcon className='mr-2' />}
        <span className={cn('text-sm font-normal')}>{currentTitle}</span>
        <ArrowUp className='ml-2' />
      </button>
      {isVisible && (
        <form
          ref={ref}
          className='absolute p-1 bg-white z-10 shadow-menu rounded -left-2 -top-3'
        >
          <fieldset>
            {options.map((option) => {
              const Icon = optionsMap[option].icon;
              return (
                <label
                  key={option}
                  className='pl-3 py-2 pr-2 flex items-center rounded relative'
                >
                  <input
                    type='radio'
                    name={selectorName}
                    value={option}
                    checked={option === currentOption}
                    onChange={handleChange}
                    className='sr-only'
                    disabled={optionsMap[option].disabled}
                  />
                  {optionsMap[option].comingSoon && <ComingSoon right={0} top={11} />}
                  <div className='w-57.5 ml-2.5'>
                    <h6 className='flex'>
                      {!!Icon && (
                        <span className='flex items-center'>
                          <Icon className='mr-2' />
                        </span>
                      )}
                      {optionsMap[option].title}
                    </h6>
                    <p className='text-12-16 text-text60 mt-1'>
                      {optionsMap[option].description}
                    </p>
                  </div>
                  {option === currentOption && <Check />}
                </label>
              );
            })}
          </fieldset>
          <div style={{ padding: '8px 8px 8px 12px'}}>
            <Button
              type='button'
              label='Convert to member'
              styleType='big-gray'
              className='h-[34px]'
              onClick={onConfitm}
            />
          </div>
        </form>
      )}
    </div>
  );
}

export default GuestOptions;
