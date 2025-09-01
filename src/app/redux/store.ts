import { authApi } from './api/authApi';
import { configureStore } from '@reduxjs/toolkit';
import { userApi } from './api/userApi';
import userReducer from '@app/redux/features/userSlice';
import unitsReducer from '@app/redux/features/unitsSlice';
import modalsReducer from '@app/redux/features/modalsSlice';
import commentsSlice from './features/commentsSlice';
import commentsSidebar from './features/commentsSidebar';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    me: userReducer,
    units: unitsReducer,
    modals: modalsReducer,
    comments: commentsSlice,
    commentsSidebar: commentsSidebar,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(authApi.middleware)
      .concat(userApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
