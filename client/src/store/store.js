import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/authSlice'
import filesReducer from './features/fileSlice'
export const store = configureStore({
  reducer: {
    auth:authReducer,
    files:filesReducer
  },
})