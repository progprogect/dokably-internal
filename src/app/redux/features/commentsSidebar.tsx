import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  editorState: undefined,
  sidePanel: false,
};

const commentsSliceSidebar = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setSidePanelState(state, action) {
      state.sidePanel = action.payload;
    },
  },
});

export const { setSidePanelState } = commentsSliceSidebar.actions;
export default commentsSliceSidebar.reducer;
