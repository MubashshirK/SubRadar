import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useAuthTokenReady } from "@/lib/authStore";

// ------------------------------------------------------------------
// Environment validation
// ------------------------------------------------------------------
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
  );
}

// ------------------------------------------------------------------
// Typed database schema for per-user tables
// ------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          plan: string | null;
          category: string | null;
          payment_method: string | null;
          status: string | null;
          start_date: string | null;
          price: number;
          currency: string | null;
          billing: string;
          renewal_date: string | null;
          color: string | null;
          domain: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["subscriptions"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["subscriptions"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["subscriptions"]["Insert"]
        >;
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          currency: string | null;
          theme_mode: string | null;
          billing_alert_enabled: boolean | null;
          billing_alert_days: number | null;
          renewal_reminder_enabled: boolean | null;
          renewal_reminder_days: number | null;
          custom_categories: string[] | null;
          has_onboarded: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["user_settings"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["user_settings"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["user_settings"]["Insert"]
        >;
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          table_name: string;
          record_id: string | null;
          old_data: Record<string, unknown> | null;
          new_data: Record<string, unknown> | null;
          created_at: string;
        };
      };
    };
  };
}

// ------------------------------------------------------------------
// Singleton Supabase client (anon key – RLS enforced)
// ------------------------------------------------------------------
let clientInstance: SupabaseClient<Database> | null = null;
let _authToken: string | null = null;

/** Store a Clerk JWT so subsequent Supabase requests include it. */
export function setSupabaseAuthToken(token: string | null): void {
  _authToken = token;
  // Force client recreation so global.headers picks up the new token
  clientInstance = null;
  useAuthTokenReady.getState().setSupabaseTokenReady(!!token);
}

function buildClient(): SupabaseClient<Database> {
  const headers: Record<string, string> = {};
  if (_authToken) {
    headers["Authorization"] = `Bearer ${_authToken}`;
  }
  return createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: { headers },
  });
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!clientInstance) {
    clientInstance = buildClient();
  }
  return clientInstance;
}

export type { SupabaseClient };
