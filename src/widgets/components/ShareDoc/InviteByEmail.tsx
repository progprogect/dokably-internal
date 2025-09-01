import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { inviteMembers, modifyUserAccessLevel, searchUsers, User } from '@app/services/share.service';
// import Button from '@shared/common/Button';
import { DEFAULT_STATE, InviteAccesOptions } from './InviteAccesOptions';
import { getInitials } from './MemberListItem';
import { AccessState } from './types';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { ReactComponent as Close } from '@images/close.svg';
import toast from 'react-hot-toast';
import { errorToastOptions, successToastOptions } from '@shared/common/Toast';
import { track } from '@amplitude/analytics-browser';
import { useDispatch } from 'react-redux';
import { updateShareModalState } from '@app/redux/features/modalsSlice';
import { InviteConfirmation } from './InviteConfirmation';
import { WorkspaceMembersForUnit } from '@entities/models/workspace';

interface IInviteByEmail {
  onInvite?: () => void;
  onInviteError?: () => void;
  onChange?: (state: any) => void;
  hideMembership?: boolean;
  hideAccessLevel?: boolean;
  hideSubDocs?: boolean;
  unitId: string;
  isInviting?: boolean;
  setIsInviting?: (value: boolean) => void;
  members: WorkspaceMembersForUnit;
  emailInvitingIsDisabled?: boolean;
}

const EMAIL_SPLIT_REGEX = /[\s,\n]+/; // Comma, new line, or space is present

function parseValidEmails(input: string): string[] {
  return input
    .split(EMAIL_SPLIT_REGEX)
    .map((e: string) => e.trim())
    .filter((e: string) => validateEmail(e));
}

function emailsToUsers(emails: string[]): User[] {
  return emails.map((email: string) => ({ id: Date.now().toString() + Math.random(), email, name: '' }));
}

export function InviteByEmail(props: IInviteByEmail) {
  const [accessOptions, setAccessOptions] = useState(DEFAULT_STATE);
  const [selectedOptions, setSelectedOptions] = useState<User[]>([]);
  const [options, setOptions] = useState<User[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const dispatch = useDispatch();

  const userIsInvited = useMemo(() => {
    const membersEmails = props.members.map(member => member.user?.email);
    const selectedEmails = selectedOptions.map(option => option.email);
    return membersEmails.some(item => selectedEmails.includes(item));
  }, [emailInput]);

  function resetValues() {
    setAccessOptions(DEFAULT_STATE);
    setOptions([]);
    setSelectedOptions([]);
  }

  const handleInvite = () => {
    toast.success(
      `${selectedOptions.length === 1 ? 'Invite' : 'Invites'} successfully sent!`,
      successToastOptions,
    );
  };

  const handleInviteError = () => {
    toast.error('Invite sending error', errorToastOptions);
  };

  const handleSelectChange = (newValue: User[]) => {
    if (!newValue) return;
    const newState = Array.isArray(newValue) ? newValue : [newValue];
    if (props.onChange) {
      props.onChange({ invites: newState, options: accessOptions });
    }
  };

  const handleAccessApply = (data: AccessState) => {
    setAccessOptions(data);
  };

  const handleUpdateAccessLevel = () => {
    if (!props.unitId) return;
    if (props.setIsInviting) props.setIsInviting(true);
    try {
      const selectedEmails = selectedOptions.map(option => option.email);
      const ids = selectedEmails.map(email => props.members.find(member => member.user.email === email)?.user?.id || "");
      console.log(props.members, selectedOptions);
      
      ids.forEach((id: string) => {
        modifyUserAccessLevel(accessOptions.access, id, props.unitId);
      });
      dispatch(updateShareModalState({ isOpen: false, title: '', unitId: '' }));
      toast.success('Access level successfully changed!', successToastOptions);
    } catch (e) {
      toast.error('Unable change access level', errorToastOptions);
    }
    if (props.setIsInviting) props.setIsInviting(false);
  };

  const handleSendInvite = async () => {
    if (props.setIsInviting) props.setIsInviting(true);
    let emailsToSend = selectedOptions;
    if (emailsToSend.length === 0 && emailInput) {
      const emails = parseValidEmails(emailInput);
      if (emails.length > 0) {
        emailsToSend = emailsToUsers(emails);
        setSelectedOptions(emailsToSend);
      } else {
        props.onInviteError ? props.onInviteError() : handleInviteError();
        return;
      }
    }

    if (emailsToSend.length === 0) {
      props.onInviteError ? props.onInviteError() : handleInviteError();
      return;
    }

    const payload = {
      emails: emailsToSend.map((el) => (el as User).email),
      access: accessOptions.access,
      role: accessOptions.participant,
    };
    try {
      await inviteMembers(payload, props.unitId).then((response) => {
        if (!response?.ok) throw new Error('Invite sending error');
        track('document_share_invite_sent');
        props.onInvite ? props.onInvite() : handleInvite();
        dispatch(updateShareModalState({ isOpen: false, title: '', unitId: '' }));
      });
    } catch (e) {
      props.onInviteError ? props.onInviteError() : handleInviteError();
    }
    if (props.setIsInviting) props.setIsInviting(false);
    resetValues();
  };

  return (
    <div className={`invitebyemail ${props.emailInvitingIsDisabled ? 'is-disabled' : ''}`}>
      <div className='flex items-center invitebyemail__select'>
        <Combobox
          onChange={handleSelectChange}
          options={options}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          setOptions={setOptions}
          unitId={props.unitId}
          emailInput={emailInput}
          setEmailInput={setEmailInput}
        />
        <InviteAccesOptions
          className='invitebyemail__options p-2'
          onApply={handleAccessApply}
          isButtonLike
          hideAccessLevel={props.hideAccessLevel}
          hideMembership={props.hideMembership || userIsInvited}
          showCanCommentAccessLevel={false}
          keepPopupAfterSelect
        />
      </div>
      <InviteConfirmation
        buttonText={userIsInvited ? 'Update' : 'Invite'}
        onButtonClick={userIsInvited ? handleUpdateAccessLevel : handleSendInvite}
        newMembers={selectedOptions?.map(option => option?.email)}
        confirm={accessOptions?.participant === "member"}
      />
    </div>
  );
}

interface ICombobox {
  onChange?: (options: User[]) => void;
  selectedOptions: User[];
  options: User[];
  setSelectedOptions: (options: User[]) => void;
  setOptions: (options: User[]) => void;
  unitId: string;
  emailInput: string;
  setEmailInput: React.Dispatch<React.SetStateAction<string>>;
}

export function Combobox(props: ICombobox) {
  const { selectedOptions, options, setSelectedOptions, setOptions, onChange, unitId, emailInput, setEmailInput } = props;
  const { ref, isVisible, setIsVisible } = useClickOutside(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (options.length) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [options]);

  const debounceGetOptions = useCallback(
    (searchString: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      };
      debounceRef.current = setTimeout(() => {
        getOptions(searchString);
      }, 400);
    },
    [],
  )

  async function getOptions(searchString: string) {
    if (!unitId) return;
    return searchUsers(searchString, unitId)
      .then((results) => {
        return !!results ? results.filter((item) => !item.deleted) : [];
      })
      .then((data) => {
        return setOptions(data.filter((option) => !option.deleted));
      });
  }

  const updateSelectedOptions = useCallback(
    (newOptions: User[]) => {
      setSelectedOptions([...selectedOptions, ...newOptions]);
      setEmailInput('');
      if (onChange) {
        onChange([...selectedOptions, ...newOptions]);
      }
  
    },
    [selectedOptions, onChange, setSelectedOptions, setEmailInput],
  )

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setEmailInput(value);

    if (EMAIL_SPLIT_REGEX.test(value)) {
      const emails = parseValidEmails(value);

      if (emails.length > 0) {
        const newOptions = emailsToUsers(emails);
        updateSelectedOptions(newOptions);
      }

      return;
    }
    
    if (value.length > 2) {
      debounceGetOptions(value);
    }
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && emailInput && validateEmail(emailInput.trim())) {
      const newOption = { id: Date.now().toString() + Math.random(), email: emailInput.trim(), name: '' };
      updateSelectedOptions([newOption]);
      event.preventDefault();
    }
  }

  function handleOptionSelect(option: User) {
    const newOptions = [...selectedOptions, option];
    setSelectedOptions(newOptions);
    setOptions(options.filter((el) => el.id !== option.id));
    setEmailInput('');
    if (onChange) {
      onChange(newOptions);
    }
  }

  function handleOptionDelete(option: User) {
    const newOptions = selectedOptions.filter(
      (selectedOption) => selectedOption.id !== option.id,
    );
    if (!!option.name) {
      setOptions([...options, option]);
    }
    setSelectedOptions(newOptions);
    if (onChange) {
      onChange(newOptions);
    }
  }

  function handleCreateOption(event: React.UIEvent<HTMLButtonElement>) {
    const newOption = { id: Date.now().toString(), email: emailInput, name: '' };
    updateSelectedOptions([newOption]);
  }

  function handleInputBlur(event: React.FocusEvent<HTMLInputElement>) {
    if (emailInput.length > 0 && validateEmail(emailInput)) {
      const newOption = {
        id: Date.now().toString(),
        email: event.target.value,
        name: '',
      };
      updateSelectedOptions([newOption]);
    }
  }

  const Option = ({ user }: { user: User }) => {
    return (
      <div className='member-item__inner member-item--option '>
        <svg
          role='image'
          aria-label={`${user.name}'s avatar`}
          preserveAspectRatio='xMidYMid slice'
          viewBox='0 0 120 60'
          className='member-item__image'
        >
          <image
            width='100%'
            height='100%'
            xlinkHref={user.imageSrc}
          ></image>
          <text
            x='50%'
            y='50%'
            dominantBaseline='middle'
            textAnchor='middle'
            fontSize='1.5rem'
          >
            {getInitials(user.name || user.email)}
          </text>
        </svg>
        <span className='member-item__text'>{user.name}</span>
      </div>
    );
  };

  return (
    <div
      className='combobox'
      ref={ref}
    >
      <div className='selected-options'>
        {selectedOptions.map((option) => (
          <div
            className='selected-option'
            key={option.id}
          >
            {option.email}
            <button
              className='delete-button'
              onClick={() => handleOptionDelete(option)}
            >
              <Close className='cursor-pointer' />{' '}
            </button>
          </div>
        ))}
        <input
          type='text'
          value={emailInput}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder='Enter email(s)'
        />
      </div>
      {isVisible && (
        <ul className='options-list'>
          {options.map((option) => (
            <li
              key={option.id}
              onClick={() => handleOptionSelect(option)}
            >
              <Option user={option} />
            </li>
          ))}
          {emailInput !== '' && (
            <li className='member-item__inner member-item--option'>
              <button onClick={handleCreateOption}>Invite {emailInput}</button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function getAutocomplete() {
  return [
    {
      id: '6432f9212e23f607948bb092',
      email: 'joniware@prismatic.com',
      name: 'Levy Roman',
      deleted: true,
    },
    {
      id: '6432f921a2e05ec129f7639d',
      email: 'levyroman@prismatic.com',
      name: 'Caldwell Fernandez',
      deleted: true,
    },
    {
      id: '6432f921f0b30f3f874eb2ce',
      email: 'caldwellfernandez@prismatic.com',
      name: 'Colon Bond',
      deleted: false,
    },
    {
      id: '6432f921a399d6e293685f87',
      email: 'colonbond@prismatic.com',
      name: 'Winifred Murray',
      deleted: false,
    },
    {
      id: '6432f9217825405fb7955c67',
      email: 'winifredmurray@prismatic.com',
      name: 'Cortez Tate',
      deleted: false,
    },
    {
      id: '6432f921eabf2a4cf30bc8f9',
      email: 'corteztate@prismatic.com',
      name: 'Kidd Hyde',
      deleted: false,
    },
    {
      id: '6432f9219565fca050429638',
      email: 'kiddhyde@prismatic.com',
      name: 'Irma Weaver',
      deleted: true,
    },
  ];
}
