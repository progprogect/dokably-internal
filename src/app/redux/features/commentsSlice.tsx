import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  update: 0,
  updateDescription: 0,
};

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setUpdate(state, action) {
      state.update = state.update + action.payload;
    },
    setUpdateDescription(state, action) {
      state.updateDescription = state.updateDescription + action.payload;
    },
  },
});

export const { setUpdate, setUpdateDescription } = commentsSlice.actions;
export default commentsSlice.reducer;
