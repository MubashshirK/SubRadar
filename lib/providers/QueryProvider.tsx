import React, { useEffect, useRef } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, asyncStoragePersister } from "@/lib/queryClient";
import { useAuth } from "@clerk/expo";
import {
  setSupabaseJWT,
  clearSupabaseAuth,
  loadSupabaseJWT,
} from "@/lib/authProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const prevSignedIn = useRef(isSignedIn);

  // Restore Supabase JWT on cold start (from SecureStore)
  useEffect(() => {
    loadSupabaseJWT();
  }, []);

  // Set Supabase JWT when sign-in state changes (fresh token from Clerk)
  useEffect(() => {
    if (!isSignedIn || !getToken) return;

    const setup = async () => {
      try {
        const token = await getToken({ template: "supabase" }).catch(
          () => null,
        );
        if (token) {
          await setSupabaseJWT(token);
          queryClient.invalidateQueries();
        }
      } catch {
        // No JWT template configured — local-only mode
      }
    };

    setup();
  }, [isSignedIn, getToken]);

  // Refresh Supabase JWT every 30 minutes while signed in (avoids 1-hour expiry)
  useEffect(() => {
    if (!isSignedIn || !getToken) return;

    const interval = setInterval(async () => {
      try {
        const token = await getToken({ template: "supabase" }).catch(
          () => null,
        );
        if (token) {
          await setSupabaseJWT(token);
        }
      } catch {
        // silent
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  // Clear cache on sign-out
  useEffect(() => {
    if (prevSignedIn.current && !isSignedIn) {
      queryClient.clear();
      AsyncStorage.removeItem("SUB_RADAR_QUERY_CACHE");
      clearSupabaseAuth();
    }
    prevSignedIn.current = isSignedIn;
  }, [isSignedIn]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
