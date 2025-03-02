import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FileUploadState {
  files: Array<{
    fileId: string;
    filePath: string;
    uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
    retryCount: number;
    lastAttempt: string;
  }>;
}

const initialState: FileUploadState = {
  files: [],
};

const fileUploadSlice = createSlice({
  name: 'fileUpload',
  initialState,
  reducers: {
    addFile: (state, action: PayloadAction<FileUploadState['files'][0]>) => {
      state.files.push(action.payload);
    },
    updateFileStatus: (
      state,
      action: PayloadAction<{ fileId: string; status: 'pending' | 'uploading' | 'completed' | 'failed' }>
    ) => {
      const file = state.files.find((f) => f.fileId === action.payload.fileId);
      if (file) {
        file.uploadStatus = action.payload.status;
      }
    },
  },
});

export const { addFile, updateFileStatus } = fileUploadSlice.actions;
export default fileUploadSlice.reducer;