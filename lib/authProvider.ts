import { setSupabaseAuthToken } from "./supabase";
import * as SecureStore from "expo-secure-store";

// ------------------------------------------------------------------
// Clerk → Supabase JWT bridge
//
// Instead of using supabase.auth.setSession() (which requires both
// access_token AND refresh_token), we inject the Clerk JWT directly
// into the Supabase REST client's Authorization header via
// setSupabaseAuthToken(). This bypasses the GoTrue auth module
// entirely and works with any valid JWT.
// ------------------------------------------------------------------

const SUPABASE_JWT_KEY = "subradar-supabase-jwt";
const SUPABASE_JWT_EXPIRY_KEY = "subradar-supabase-jwt-expiry";

/**
 * Store a Clerk-issued JWT for Supabase and set it on the REST client.
 */
export async function setSupabaseJWT(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SUPABASE_JWT_KEY, token);
    const expiry = Date.now() + 60 * 60 * 1000;
    await SecureStore.setItemAsync(SUPABASE_JWT_EXPIRY_KEY, String(expiry));
    setSupabaseAuthToken(token);
  } catch (err) {
    console.error("[authProvider] setSupabaseJWT error:", err);
  }
}

/**
 * Load the stored JWT from secure storage and restore auth on the client.
 * Returns the token or null if none is stored or expired.
 */
export async function loadSupabaseJWT(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(SUPABASE_JWT_KEY);
    const expiryStr = await SecureStore.getItemAsync(SUPABASE_JWT_EXPIRY_KEY);

    if (!token || !expiryStr) return null;

    const expiry = parseInt(expiryStr, 10);
    if (Date.now() > expiry - 5 * 60 * 1000) {
      await clearSupabaseAuth();
      return null;
    }

    setSupabaseAuthToken(token);
    return token;
  } catch (err) {
    console.error("[authProvider] loadSupabaseJWT error:", err);
    return null;
  }
}

/**
 * Clear all stored auth tokens and revert to anon mode.
 */
export async function clearSupabaseAuth(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SUPABASE_JWT_KEY);
    await SecureStore.deleteItemAsync(SUPABASE_JWT_EXPIRY_KEY);
  } catch {
    // ignore
  }
  setSupabaseAuthToken(null);
}
