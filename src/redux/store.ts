import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/slices/userSlice';
import bookReducer from '../redux/slices/bookSlice';
import authReducer from '../redux/slices/authSlice'

const store = configureStore({
  reducer: {
    user: userReducer,  //user reducer
    books: bookReducer,  //book reducer
    auth: authReducer,  //auth reducer
  },
});

export default store;

// Optional: export RootState and AppDispatch for use with TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
