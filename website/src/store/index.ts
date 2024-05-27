import { configureStore } from '@reduxjs/toolkit';
import eventReducer from './slices/eventSlice';
import formReducer from './slices/formSlice';

const store = configureStore({
  reducer: {
    event: eventReducer,
    form: formReducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
