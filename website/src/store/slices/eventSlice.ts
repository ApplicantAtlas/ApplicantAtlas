import { EventModel } from '@/types/models/Event';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EventState {
  eventDetails: EventModel | null;
  loading: boolean;
}

const initialState: EventState = {
  eventDetails: null,
  loading: false,
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
    setEventStateIsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    }
  },
});

export const { setEventDetails, updateEventDetails, resetEventState, setEventStateIsLoading } = eventSlice.actions;
export default eventSlice.reducer;
