import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { EventModel } from '@/types/models/Event';

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
    updateEventDetails(state, action: PayloadAction<Partial<EventModel>>) {
      const keys = Object.keys(action.payload) as Array<keyof EventModel>;

      keys.forEach((key) => {
        const value = action.payload[key];
        if (value !== undefined) {
          if (state.eventDetails) {
            (state.eventDetails[key] as typeof value) = value;
          }
        }
      });
    },
    resetEventState(state) {
      state.eventDetails = null;
    },
    setEventStateIsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const {
  setEventDetails,
  updateEventDetails,
  resetEventState,
  setEventStateIsLoading,
} = eventSlice.actions;
export default eventSlice.reducer;
