import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../redux/features/userSlice';
import { useEffect, useState } from 'react';
import { User } from '../services/share.service';

const useUser = () => {
  const userState = useSelector(selectCurrentUser);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!userState || !userState.isLoggedIn) {
      setUser(null);
    } else {
      setUser(user);
    }
  }, [userState]);

  return !userState || !userState.isLoggedIn ? null : userState.user;
};

export default useUser;
