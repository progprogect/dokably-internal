import { Checkbox } from '@widgets/components/ShareDoc/InviteAccesOptions';
import Button from '@shared/common/Button';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { useEffect, useState } from 'react';
import { ReactComponent as ArrowUp } from '@images/arrowUp.svg';
import cn from 'classnames';
import './style.css';
import { track } from '@amplitude/analytics-browser';

type AccessType = 'Open' | 'Private';

const ChannelAccess = ({ state, onApply }: any) => {
  const [localState, setLocalState] = useState(state);
  const { ref, isVisible, setIsVisible } = useClickOutside(false, () => {
    track('create_channel_access_closed');
  });

  const handleApply = () => {
    track('create_channel_access_saved', {
      option: localState === 'Open' ? 'open' : 'private',
    });
    onApply(localState);
    setIsVisible(false);
  };

  useEffect(() => {
    if (localState !== state) {
      setLocalState(state);
    }
    if (isVisible) {
      track('create_channel_access_popup');
    }
  }, [isVisible]);

  return (
    <div className='relative'>
      <Button
        styleType='input-text'
        label={localState}
        iconAfter={
          <ArrowUp className={cn('ml-2', { 'rotate-180': isVisible })} />
        }
        onClick={() => setIsVisible(!isVisible)}
        className='channel-settings__row__access-button'
      />

      {isVisible && (
        <form
          ref={ref}
          onSubmit={handleApply}
          className='flex flex-col absolute top-full right-0 bg-white p-4 rounded accesstype__dropdown z-10 text-sm3l'
          style={{ width: '200px' }}
        >
          <fieldset className='flex flex-col mb-4'>
            <legend className='uppercase text-text40 mb-2 text-xs3'>
              Access
            </legend>
            <Checkbox
              label='Private'
              name='access'
              value={'Private' as AccessType}
              checked={localState === 'Private'}
              onChange={() => setLocalState('Private')}
              className='mr-2'
            />
            <Checkbox
              label='Open'
              name='access'
              value={'Open' as AccessType}
              checked={localState === 'Open'}
              onChange={() => setLocalState('Open')}
              className='mr-2'
            />
          </fieldset>
          <Button
            type='button'
            label='Apply'
            styleType='primary'
            className='h-[34px]'
            onClick={handleApply}
          />
        </form>
      )}
    </div>
  );
};

export default ChannelAccess;
