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
    setEventDetails(state, action: PayloadAction<EventModel>) {
      state.eventDetails = action.payload;
    },
    updateEventDetails(state, action: PayloadAction<any>) {
      state.eventDetails = { ...state.eventDetails, ...action.payload };
    },
    resetEventState(state) {
      state.eventDetails = null;
    },
  },
});

export const { setEventDetails, updateEventDetails, resetEventState } = eventSlice.actions;
export default eventSlice.reducer;
