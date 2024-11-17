import {configureStore} from '@reduxjs/toolkit';
import toastSlice from './redux/toastSlice';

export const store = configureStore({
    reducer: {
        toasts: toastSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;