import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { FormStructure } from '@/types/models/Form';

interface FormState {
  formDetails: FormStructure | null;
}

const initialState: FormState = {
  formDetails: null,
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setFormDetails(state, action: PayloadAction<FormStructure>) {
      state.formDetails = { ...action.payload };
    },
    updateFormDetails(state, action: PayloadAction<Partial<FormStructure>>) {
      const keys = Object.keys(action.payload) as Array<keyof FormStructure>;

      keys.forEach((key) => {
        const value = action.payload[key];
        if (value !== undefined) {
          if (state.formDetails) {
            (state.formDetails[key] as typeof value) = value;
          }
        }
      });
    },
    resetFormState(state) {
      state.formDetails = null;
    },
  },
});

export const { setFormDetails, updateFormDetails, resetFormState } =
  formSlice.actions;
export default formSlice.reducer;
