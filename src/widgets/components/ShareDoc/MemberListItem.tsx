import { InviteAccesOptions } from './InviteAccesOptions';
import { AccessState, AccessTypes, ParticipantType } from './types';
import { ReactComponent as WorldIcon } from '@images/world.svg';
import { ReactComponent as Logo } from '@images/logo.svg';
import cn from 'classnames';

interface IMemberItem {
  onChange: Function;
  imageSrc?: string;
  name: string;
  email: string;
  memberId: string;
  status?: string;
  role?: ParticipantType;
  access?: AccessTypes;
  showLogo?: boolean;
  toTop?: boolean;
  canChangeRoles?: boolean;
}

const roleMap = {
  admin: 'Admin',
  owner: 'Owner',
  member: 'Member',
  guest: 'Guest',
};

export function MemberListItem(props: IMemberItem) {
  const onApplyChanges = (state: AccessState) => {
    if (props.onChange) {
      props.onChange(state.access, props.memberId);
    }
  };

  return (
    <div className='member-item'>
      <div className='member-item__inner'>
        {!props.showLogo ? (
          <svg
            role='image'
            aria-label={`${props.name}'s avatar`}
            preserveAspectRatio='xMidYMid slice'
            viewBox='0 0 120 60'
            className='member-item__image'
          >
            <image
              width='100%'
              height='100%'
              xlinkHref={props.imageSrc}
            ></image>
            <text
              x='50%'
              y='50%'
              dominantBaseline='middle'
              textAnchor='middle'
              fontSize='1.5rem'
            >
              {getInitials(props.name || props.email)}
            </text>
          </svg>
        ) : (
          <Logo style={{ width: 20, height: 20, marginRight: '0.5rem' }} />
        )}
        <span className='member-item__text '>{props.name || props.email}</span>
        {!!props.role && (
          <span
            className={cn('member-item__role', {
              '!text-primaryHover !flex justify-center': props.role === 'guest',
            })}
          >
            {props.role === 'guest' ? <WorldIcon className='w-2.51 mr-0.5' /> : ''}
            {roleMap[props.role]}
          </span>
        )}
      </div>
      <InviteAccesOptions
        className=''
        onApply={onApplyChanges}
        initialAccessType={props.access || undefined}
        hideMembership
        hasNoAccessLevel
        isOnlyTitle={props.role === 'owner' || !props.canChangeRoles}
        showCanCommentAccessLevel={false}
        toTop={props.toTop}
      />
    </div>
  );
}

export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((string) => string[0])
    .join('')
    .toUpperCase();
}
