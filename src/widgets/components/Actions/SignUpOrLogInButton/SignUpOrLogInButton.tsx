import { useNavigate, useParams } from 'react-router-dom';
import { ReactComponent as Icon } from '@icons/user-sign-up-or-login-btn-icon.svg';
import ActiveButton from '@shared/uikit/active-button';
import { logout } from '@app/redux/features/userSlice';
import { useDispatch } from 'react-redux';

type Props = {
  callback?: () => void;
};

const SignUpOrLogInButton = ({ callback }: Props) => {
  const navigate = useNavigate();
  const { unitId } = useParams();
  const dispatch = useDispatch();

  const handleClick = async () => {
    dispatch(logout());
    navigate(`/login?returnURL=/workspace/${unitId}`);
    callback && callback();
  };

  return (
    <ActiveButton
      leftSection={<Icon />}
      onClick={handleClick}
    >
      Sign Up or Log In
    </ActiveButton>
  );
};

export default SignUpOrLogInButton;
