import { configureStore } from '@reduxjs/toolkit';
import eventReducer from './slices/eventSlice';
import formReducer from './slices/formSlice';
import pipelineReducer from './slices/pipelineSlice';

const store = configureStore({
  reducer: {
    event: eventReducer,
    form: formReducer,
    pipeline: pipelineReducer
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
