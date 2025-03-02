import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PrintSettingsState {
  settings: {
    fileId: string;
    colorMode: 'bw' | 'color';
    copies: number;
    size: 'A4' | 'A3' | 'Letter';
    binding: {
      type: 'punch' | 'staple' | 'none';
      position: 'left' | 'top';
    };
    printType: 'single' | 'double';
    priority: boolean;
    additionalInstructions: string;
  }[];
}

const initialState: PrintSettingsState = {
  settings: [],
};

const printSettingsSlice = createSlice({
  name: 'printSettings',
  initialState,
  reducers: {
    addPrintSettings: (state, action: PayloadAction<PrintSettingsState['settings'][0]>) => {
      state.settings.push(action.payload);
    },
  },
});

export const { addPrintSettings } = printSettingsSlice.actions;
export default printSettingsSlice.reducer;