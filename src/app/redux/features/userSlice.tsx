import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { IUser } from '@entities/models/IUser';
import type { RootState } from '../store';

export interface IUserState {
  user: IUser | null;
  isLoggedIn: boolean;
}

const initialState: IUserState = {
  user: null,
  isLoggedIn: false,
};

export const userSlice = createSlice({
  initialState,
  name: 'userSlice',
  reducers: {
    logout: () => {
      localStorage.clear();
      return initialState;
    },
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      Object(window).Intercom('boot', {
        api_base: 'https://api-iam.intercom.io',
        app_id: 'xbzqqob2',
        name: action.payload.name ?? action.payload.email, // Full name
        email: action.payload.email, // Email address
        created_at: Date.now(), // Signup date as a Unix timestamp
      });
    },
  },
});

export default userSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.me;
export const selectIsLoggedIn = (state: RootState) => state.me.isLoggedIn;

export const { logout, setUser } = userSlice.actions;
