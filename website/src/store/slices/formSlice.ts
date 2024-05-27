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
    setFormDetails(state, action: PayloadAction<any>) {
      state.formDetails = action.payload;
    },
    updateFormDetails(state, action: PayloadAction<any>) {
      state.formDetails = { ...state.formDetails, ...action.payload };
    },
  },
});

export const { setFormDetails, updateFormDetails } = formSlice.actions;
export default formSlice.reducer;
