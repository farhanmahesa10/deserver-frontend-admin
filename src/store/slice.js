import { createSlice } from "@reduxjs/toolkit";

export const counterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0,
    outlet: [],
    status: "idle",
    error: null,
  },
  reducers: {
    setOutlet(state, action) {
      state.outlet = action.payload;
    },
  },
});

export const { setOutlet } = counterSlice.actions;
export default counterSlice.reducer;
