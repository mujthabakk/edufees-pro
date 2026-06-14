import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser, LoginResponse } from "@edufees/shared-types";
import { tokenStorage } from "@/lib/api/token-storage";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Rehydrate auth state from localStorage on app load.
    hydrate(state) {
      const user = tokenStorage.getUser();
      const token = tokenStorage.getAccess();
      state.user = user;
      state.isAuthenticated = Boolean(user && token);
      state.hydrated = true;
    },
    setCredentials(state, action: PayloadAction<LoginResponse>) {
      const { accessToken, refreshToken, user } = action.payload;
      tokenStorage.set(accessToken, refreshToken, user);
      state.user = user;
      state.isAuthenticated = true;
    },
    logout(state) {
      tokenStorage.clear();
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { hydrate, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
