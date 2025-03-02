// src/store/index.ts
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from '../slices/authSlice';
import fileUploadReducer from '../slices/fileUploadSlice';
import printSettingsReducer from '../slices/printSettingsSlice';
import themeReducer from '../slices/themeSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  fileUpload: fileUploadReducer,
  printSettings: printSettingsReducer,
  theme: themeReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;