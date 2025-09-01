import cn from 'classnames';

import { ReactComponent as ArrowUp } from '@images/arrowUp.svg';
import Button from '@shared/common/Button';
import { ChangeEvent, useState, useMemo, memo, useEffect } from 'react';
import {
  AccessState,
  AccessTypes,
  IInviteAcces,
  InviteeType,
} from './types';
import { AccessLabels, ACCESS_TYPES, INVITEE_TYPES, INVITEE_TYPES_LABELS, AccessDescriptions } from './constants';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { track } from '@amplitude/analytics-browser';
import ComingSoon from '@widgets/components/ComingSoon';

export const DEFAULT_STATE = {
  access: 'full_access',
  participant: 'member',
  subDocs: true,
} as AccessState;

export const InviteAccesOptions = memo(({
  onApply,
  className,
  hideMembership,
  hideAccessLevel,
  hasNoAccessLevel,
  hasFullAccessLevel = true,
  isButtonLike,
  isOnlyTitle,
  initialAccessType = 'full_access',
  showCanCommentAccessLevel = true,
  toTop,
  keepPopupAfterSelect,
}: IInviteAcces) => {
  // const restoreState = () => {
  //   if (!isChanged) {
  //     setIsChanged(false);
  //     setAccessType(initialAccessType);
  //   }
  // };

  const { ref, isVisible, setIsVisible } = useClickOutside(false);

  const [accessType, setAccessType] = useState<AccessTypes>(initialAccessType);
  const [participantType, setParticipantType] = useState<InviteeType>('member');

  // const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    setAccessType(initialAccessType);
  }, [initialAccessType]);

  const buttonClassName = isButtonLike
    ? 'text-sm bg-background font-normal rounded-md whitespace-nowrap w-full'
    : 'ml-auto font-normal text-sml';

  const handleToggleDrawer = () => {
    if (!isOnlyTitle) {
      isVisible ? closeForm() : openForm();
    }
  };

  const openForm = () => {
    track('document_share_invite_access_opened');
    setIsVisible(true);
  };

  const closeForm = () => {
    setIsVisible(false);
  };

  // const handleApply = () => {
  //   onApply({
  //     access: accessType,
  //     participant: participantType,
  //     subDocs: false,
  //   });
  //   closeForm();
  // };

  const accessDropdownOptions = useMemo(() => {
    let accessTypesToShow = ACCESS_TYPES;

    if (!hasNoAccessLevel) {
      accessTypesToShow = accessTypesToShow.filter(item => item !== 'no');
    }

    if (!hasFullAccessLevel) {
      accessTypesToShow = accessTypesToShow.filter(item => item !== 'full_access');
    }

    // if (!showCanCommentAccessLevel) {
    //   accessTypesToShow = accessTypesToShow.filter(item => item !== 'comment');
    // }

    return accessTypesToShow.map((item) => ({ value: item, label: AccessLabels[item], description: AccessDescriptions[item] }))
  }, [hasNoAccessLevel, hasFullAccessLevel, showCanCommentAccessLevel]);

  const inviteeTypesDropdownOptions = useMemo(() => {
    return INVITEE_TYPES.map((item) => ({ value: item, label: INVITEE_TYPES_LABELS[item] }))
  }, []);

  const accessLevelBtnLabel = useMemo(() => {
    if (hideAccessLevel) {
      return participantType?.toString() ?? '';
    }

    return AccessLabels[accessType];
  }, [hideAccessLevel, accessType])

  return (
    <div
      className={cn(
        'relative flex justify-items-end items-center',
        {
          'w-45': isButtonLike,
        },
        className
      )}
    >
      <Button
        styleType={isButtonLike ? 'custom' : 'input-text'}
        label={accessLevelBtnLabel}
        iconAfter={
          // !isOnlyTitle && (
            <ArrowUp
              className={cn('ml-2 w-2.5', { 'rotate-180': isVisible, 'opacity-40': isOnlyTitle })}
            />
          // )
        }
        disabled={isOnlyTitle}
        onClick={handleToggleDrawer}
        className={buttonClassName}
        labelClassName={isButtonLike ? 'py-2.25 px-2.51' : undefined}
      />
      {isVisible && (
        <form
          ref={ref}
          // onSubmit={handleApply}
          className={`flex flex-col absolute ${toTop ? "bottom-full" : "top-full"} left-0 bg-white p-[16px] rounded accesstype__dropdown z-10 text-sm3l`}
          style={{ width: '284px', maxHeight: "50vh", overflow: "auto" }}
        >
          {!hideAccessLevel && (
            <fieldset className='flex flex-col mb-4 relative'>
              <legend className='uppercase text-text40 mb-2 text-xs3 pt-[6px] ml-3'>
                Access
              </legend>
              {
                accessDropdownOptions.map((item, index) => (
                  <Checkbox
                    key={index}
                    label={item.label}
                    description={item.description}
                    name='access'
                    value={item.value}
                    checked={item.value === accessType}
                    onChange={() => {
                      setAccessType(item.value);
                      onApply({
                        access: item.value,
                        participant: participantType,
                        subDocs: false,
                      });
                      if (!keepPopupAfterSelect) {
                        closeForm();
                      }
                    }}
                    className='mr-2'
                    labelClassName={item.value === 'no' ? '!text-errorText' : '' }
                  />
                ))
              }
            </fieldset>
          )}
          {!hideMembership && (
            <fieldset className='flex flex-col mb-2.5 relative'>
              <legend className='uppercase  text-text40 mb-2 text-xs3 ml-3'>
                Invite as
              </legend>
              {
                inviteeTypesDropdownOptions.map(item => (
                  <Checkbox
                    label={item.label}
                    name='invite'
                    value={item.value}
                    checked={participantType === item.value}
                    onChange={() => {
                      setParticipantType(item.value);
                      onApply({
                        access: accessType,
                        participant: item.value,
                        subDocs: false,
                      });
                    }}
                    className='mr-2'
                  />
                ))
              }
            </fieldset>
          )}
          {/* <div className='width-full border  border-solid border-text10' />
          <Button
            type='button'
            label='Apply'
            styleType='primary'
            className='invitebyemail__button h-[34px] mt-[10px]'
            onClick={handleApply}
          /> */}
        </form>
      )}
    </div>
  );
});

interface ICheckbox {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  checked: boolean;
  label: string;
  description?: string;
  name: string;
  value: string;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
  comingSoon?: boolean;
}
export function Checkbox(props: ICheckbox) {
  const {
    onChange,
    checked,
    label,
    description,
    name,
    value,
    className,
    labelClassName,
    disabled,
    comingSoon,
  } = props;
  return (
    <div className='radio_checkbox'>
      {comingSoon && <ComingSoon right={0} />}
      <input
        type='radio'
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className={className}
        id={`${name}_${value}`}
        disabled={disabled}
      />
      <label className={labelClassName} htmlFor={`${name}_${value}`}>
        {label}
      </label>
      {description && (
        <p>{description}</p>
      )}
    </div>
  );
}