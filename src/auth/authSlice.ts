import { createSlice } from "@reduxjs/toolkit";
import {initializeAuth} from "./authThunk";

interface initialStateType {
  isAuthenticated: boolean;
  userRole: "admin" | "user" | "manager"|null;
  accessToken: string | null;
}

const initialState: initialStateType = {
  isAuthenticated: false,
  userRole: null,
  accessToken: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.userRole = action.payload.userRole;
      state.accessToken = action.payload.accessToken;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.userRole = null;
      state.accessToken = null;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload.accessToken;
    },
  },
  extraReducers: (builder) => {

    builder.addCase(initializeAuth.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.userRole = action.payload.userRole;
      state.accessToken = action.payload.accessToken;
    });
   builder.addCase(initializeAuth.rejected, (state) => {
      state.isAuthenticated = false;
      state.userRole = null;
      state.accessToken = null;
    });
  },
 
});
