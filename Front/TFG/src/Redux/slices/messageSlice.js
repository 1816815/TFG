import { createSlice } from "@reduxjs/toolkit";

const flashMessageSlice = createSlice({
  name: "flashMessage",
  initialState: {
    message: null,
    type: "info",
  },
  reducers: {
    showFlashMessage: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type || "info";
    },
    clearFlashMessage: (state) => {
      state.message = null;
    },
  },
});

export const { showFlashMessage, clearFlashMessage } = flashMessageSlice.actions;
export default flashMessageSlice.reducer;
