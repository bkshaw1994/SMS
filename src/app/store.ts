import { configureStore } from "@reduxjs/toolkit";
import { schoolApi } from "../services/schoolApi";

export const store = configureStore({
  reducer: {
    [schoolApi.reducerPath]: schoolApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(schoolApi.middleware),
});
