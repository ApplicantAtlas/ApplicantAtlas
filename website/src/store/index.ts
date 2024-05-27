import { configureStore } from '@reduxjs/toolkit';
import eventReducer, { resetEventState } from './slices/eventSlice';
import formReducer, { resetFormState } from './slices/formSlice';
import pipelineReducer, { resetPipelineState } from './slices/pipelineSlice';
import emailTemplateReducer, { resetEmailTemplateState } from './slices/emailTemplateSlice';

const store = configureStore({
  reducer: {
    event: eventReducer,
    form: formReducer,
    pipeline: pipelineReducer,
    emailTemplate: emailTemplateReducer,
  },
});

// Used to clear out all tab state when switching between tabs
export const resetTabs = () => {
  store.dispatch(resetEventState());
  store.dispatch(resetFormState());
  store.dispatch(resetPipelineState());
  store.dispatch(resetEmailTemplateState());
}

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
