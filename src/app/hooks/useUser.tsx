import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../redux/features/userSlice';

const useUser = () => {
  const userState = useSelector(selectCurrentUser);
  
  // Возвращаем пользователя только если он залогинен
  return userState?.isLoggedIn ? userState.user : null;
};

export default useUser;
