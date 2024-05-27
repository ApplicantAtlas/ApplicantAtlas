import { FormStructure } from '@/types/models/Form';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
      state.formDetails = action.payload;
    },
    updateFormDetails(state, action: PayloadAction<any>) {
      state.formDetails = { ...state.formDetails, ...action.payload };
    },
    resetFormState(state) {
      state.formDetails = null;
    },
  },
});

export const { setFormDetails, updateFormDetails, resetFormState } = formSlice.actions;
export default formSlice.reducer;
