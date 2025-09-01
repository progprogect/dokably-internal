import { Unit } from '@entities/models/unit';
import { ReactComponent as Logo } from '@icons/logo-black-guest-mode-action-panel.svg';
import { UnitActionListBtn } from '@widgets/unit-action-lists/UnitActionListBtn';
import { memo } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  unit: Unit;
  CommentButton: React.FC;
};

const AnonymousGuestUserActionsPanel: React.FC<Props> = ({ unit, CommentButton }) => (
  <div className='actions'>
    <CommentButton />
    <UnitActionListBtn
      popupAlign='end'
      size='l'
      unit={unit}
    />
    <Link
      to='/sign-up'
      className='flex items-center gap-2'
    >
      <Logo />
      Try Dokably
    </Link>
  </div>
);

export default memo(AnonymousGuestUserActionsPanel);
