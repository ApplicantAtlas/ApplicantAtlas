import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { EmailTemplate } from '@/types/models/EmailTemplate';

interface EmailTemplateState {
  emailTemplateState: EmailTemplate | null;
}

const initialState: EmailTemplateState = {
  emailTemplateState: null,
};

const formSlice = createSlice({
  name: 'emailTemplate',
  initialState,
  reducers: {
    setEmailTemplateState(state, action: PayloadAction<EmailTemplate>) {
      state.emailTemplateState = action.payload;
    },
    updateEmailTemplateState(state, action: PayloadAction<any>) {
      state.emailTemplateState = {
        ...state.emailTemplateState,
        ...action.payload,
      };
    },
    resetEmailTemplateState(state) {
      state.emailTemplateState = null;
    },
  },
});

export const {
  setEmailTemplateState,
  updateEmailTemplateState,
  resetEmailTemplateState,
} = formSlice.actions;
export default formSlice.reducer;
