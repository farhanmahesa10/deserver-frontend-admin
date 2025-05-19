import { createSlice } from "@reduxjs/toolkit";

export const counterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0,
    outlet: [],
    collapseMaster: false,
    collapseTransaction: false,
    status: "idle",
    order: [],
    notifCount: 0,
    error: null,
  },
  reducers: {
    setOutlet(state, action) {
      state.outlet = action.payload;
    },
    setCollapseMaster(state, action) {
      state.collapseMaster = action.payload;
    },
    setCollapseTransaction(state, action) {
      state.collapseTransaction = action.payload;
    },
    addOrderNotif: (state, action) => {
      state.order.unshift({ ...action.payload, seen: false });
      state.notifCount++;
    },
    markAllSeen: (state) => {
      state.order = state.order.map((item) => ({ ...item, seen: true }));
      state.notifCount = 0;
    },
    resetNotifCount: (state) => {
      state.notifCount = 0;
    },
  },
});

export const {
  setOutlet,
  setCollapseMaster,
  setCollapseTransaction,
  addOrderNotif,
  markAllSeen,
  resetNotifCount,
} = counterSlice.actions;
export default counterSlice.reducer;
