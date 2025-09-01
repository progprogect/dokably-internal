import { useClickOutside } from '@app/hooks/useClickOutside';
import { ReactComponent as ArrowUp } from '@images/arrowUp.svg';
import { ReactComponent as Check } from '@images/checkOriginal.svg';
import { ReactComponent as Private } from '@images/private.svg';
import { ReactComponent as World } from '@images/world.svg';
import { ChangeEvent, useState } from 'react';
import cn from 'classnames';
import { track } from '@amplitude/analytics-browser';
import ComingSoon from '@widgets/components/ComingSoon';

export type Option = {
  title: string;
  description: string;
  icon?: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
    }
  >;
  disabled: boolean;
  comingSoon?: boolean;
};

export type ShareLinkRoleOptionMap = Record<string, Option>;

const defaultOptionsMap: ShareLinkRoleOptionMap = {
  member: {
    title: 'Workspace members',
    description:
      'Doc via this link will be available to workspace members only.',
    icon: Private,
    disabled: false,
  },
  guest: {
    title: 'Anyone with the link',
    description:
      'Doc via this link will be available to anyone on the Internet',
    icon: World,
    disabled: true,
    comingSoon: true,
  },
};

export type OptionTypes = keyof typeof defaultOptionsMap;

interface ISharingSelector<T = typeof defaultOptionsMap> {
  onChange: Function;
  customOptionsMap?: T;
  defaultOption?: keyof T;
  selectorName: string;
  isButtonLike?: boolean;
}

export function SharingSelector({
  onChange,
  defaultOption,
  customOptionsMap,
  selectorName,
  isButtonLike,
}: ISharingSelector) {
  const optionsMap = customOptionsMap || defaultOptionsMap;
  const options = Object.keys(optionsMap) as (keyof typeof optionsMap)[];
  const [currentOption, setOption] = useState<keyof typeof optionsMap>(
    defaultOption && options.includes(defaultOption)
      ? defaultOption
      : options[0]
  );
  const { ref, isVisible, setIsVisible } = useClickOutside(false);

  const handleChange =
    (option: OptionTypes) => (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      track('document_share_visibility_changed', {
        option: option === 'member' ? 'workspace' : 'anyone',
      });
      setOption(option);
      if (onChange) {
        onChange(option);
      }

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
        // onClick={openSelector}
        className={cn('flex items-center', {
          'text-sm py-0.8 px-2.51 bg-background font-normal rounded-md whitespace-nowrap h-8.5':
            isButtonLike,
        })}
      >
        {!!CurrentIcon && <CurrentIcon className='mr-2' />}
        <span className={cn('text-sm font-normal')}>{currentTitle}</span>
        {/* <ArrowUp className='ml-2' /> */}
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
                  className='pl-3 py-2 pr-2 hover:bg-background cursor-pointer flex items-center rounded relative'
                >
                  <input
                    type='radio'
                    name={selectorName}
                    value={option}
                    checked={option === currentOption}
                    onChange={handleChange(option)}
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
        </form>
      )}
    </div>
  );
}
