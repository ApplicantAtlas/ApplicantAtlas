import { EventModel } from '@/types/models/Event';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EventState {
  eventDetails: EventModel | null;
}

const initialState: EventState = {
  eventDetails: null,
};

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setEventDetails(state, action: PayloadAction<any>) {
      state.eventDetails = action.payload;
    },
    updateEventDetails(state, action: PayloadAction<any>) {
      state.eventDetails = { ...state.eventDetails, ...action.payload };
    },
  },
});

export const { setEventDetails, updateEventDetails } = eventSlice.actions;
export default eventSlice.reducer;
