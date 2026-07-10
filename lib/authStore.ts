import { create } from "zustand";

interface AuthState {
  supabaseTokenReady: boolean;
  setSupabaseTokenReady: (ready: boolean) => void;
}

export const useAuthTokenReady = create<AuthState>((set) => ({
  supabaseTokenReady: false,
  setSupabaseTokenReady: (ready) => set({ supabaseTokenReady: ready }),
}));
