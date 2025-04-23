import { createSlice } from "@reduxjs/toolkit";

export const counterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0,
    outlet: [],
    collapse: false,
    status: "idle",
    error: null,
  },
  reducers: {
    setOutlet(state, action) {
      state.outlet = action.payload;
    },
    setCollapse(state, action) {
      state.collapse = action.payload;
    },
  },
});

export const { setOutlet, setCollapse } = counterSlice.actions;
export default counterSlice.reducer;
