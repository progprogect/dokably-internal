import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { EditorState, ContentBlock } from 'draft-js';
import { PluginFunctions } from '@draft-js-plugins/editor';

import type { RootState } from '../store';

interface IModalState {
  isOpen: boolean;
  title: string;
  unitId: string;
  isCallback?: boolean;
}

interface IBoardDeleteModalState {
  isOpen: boolean;
  editorState: EditorState | null;
  contentBlock: ContentBlock | null;
  pluginFunctions: PluginFunctions | null;
}

export interface IModalsState {
  shareModalState: IModalState;
  globalSearchModalState: IModalState;
  createChannelModalState: IModalState;
  channelSettingsModalState: IModalState;
  whiteboardSettingsModalState: IModalState;
  inviteMembersModalState: IModalState;
  deleteModalState: IModalState;
  deleteBoardModalState: IBoardDeleteModalState;
}

const initialState: IModalsState = {
  shareModalState: {
    isOpen: false,
    title: 'Share doc',
    unitId: '',
  },
  createChannelModalState: {
    isOpen: false,
    title: 'Create new channel',
    unitId: '',
  },
  channelSettingsModalState: {
    isOpen: false,
    title: 'Channel settings',
    unitId: '',
  },
  inviteMembersModalState: {
    isOpen: false,
    title: 'Invite members',
    unitId: '',
  },
  deleteModalState: {
    isOpen: false,
    title: 'Delete',
    unitId: '',
  },
  whiteboardSettingsModalState: {
    isOpen: false,
    title: 'Whiteboard settings',
    unitId: '',
  },
  globalSearchModalState: {
    isOpen: false,
    title: '',
    unitId: '',
  },
  deleteBoardModalState: {
    isOpen: false,
    editorState: null,
    contentBlock: null,
    pluginFunctions: null,
  },
};

export const modalsSlice = createSlice({
  initialState,
  name: 'units',
  reducers: {
    updateShareModalState: (state, action: PayloadAction<IModalState>) => {
      state.shareModalState = action.payload;
    },
    updateCreateChannelModalState: (
      state,
      action: PayloadAction<IModalState>,
    ) => {
      state.createChannelModalState = action.payload;
    },
    updateChannelSettingsModalState: (
      state,
      action: PayloadAction<IModalState>,
    ) => {
      state.channelSettingsModalState = action.payload;
    },
    updateinvIteMembersModalState: (
      state,
      action: PayloadAction<IModalState>,
    ) => {
      state.inviteMembersModalState = action.payload;
    },
    updateDeleteModalState: (state, action: PayloadAction<IModalState>) => {
      state.deleteModalState = action.payload;
    },
    updateWhiteboardSettingsModalState: (
      state,
      action: PayloadAction<IModalState>,
    ) => {
      state.whiteboardSettingsModalState = action.payload;
    },
    updateGlobalSearchModalState: (
      state,
      action: PayloadAction<IModalState>,
    ) => {
      state.globalSearchModalState = action.payload;
    },
    updateDeleteBoardModalState: (
      state,
      action: PayloadAction<IBoardDeleteModalState>,
    ) => {
      state.deleteBoardModalState = action.payload;
    },
  },
});

export default modalsSlice.reducer;

export const getModalState = (state: RootState) => state.modals;

export const {
  updateShareModalState,
  updateCreateChannelModalState,
  updateChannelSettingsModalState,
  updateinvIteMembersModalState,
  updateDeleteModalState,
  updateWhiteboardSettingsModalState,
  updateGlobalSearchModalState,
  updateDeleteBoardModalState,
} = modalsSlice.actions;
