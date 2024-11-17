import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface ToastMessage {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
}

interface ToastState {
    toasts: ToastMessage[];
}

const initialState: ToastState = {
    toasts: [],
};

let toastId = 0;

const toastSlice = createSlice({
    name: 'toasts',
    initialState,
    reducers: {
        addToast: (state, action: PayloadAction<Omit<ToastMessage, 'id'>>) => {
            state.toasts.push({...action.payload, id: ++toastId});
        },
        removeToast: (state, action: PayloadAction<number>) => {
            state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
        },
    },
});

export const makeToastId = () => ++toastId;

export const {addToast, removeToast} = toastSlice.actions;

export default toastSlice.reducer;
