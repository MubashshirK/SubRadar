import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase";
import { useUser } from "@clerk/expo";
import { useSettingsStore, type SettingsState } from "@/lib/settingsStore";
import { useAuthTokenReady } from "@/lib/authStore";

// ─── Transformers ───

function dbRowToSettings(row: any): Partial<SettingsState> {
  return {
    currency: row.currency ?? "USD",
    themeMode: (row.theme_mode as SettingsState["themeMode"]) ?? "system",
    billingAlertEnabled: row.billing_alert_enabled ?? false,
    billingAlertDays: row.billing_alert_days ?? 3,
    renewalReminderEnabled: row.renewal_reminder_enabled ?? false,
    renewalReminderDays: row.renewal_reminder_days ?? 1,
    customCategories: row.custom_categories ?? [],
    hasOnboarded: row.has_onboarded ?? false,
  };
}

function settingsToDbRow(
  settings: Partial<SettingsState>,
  userId: string,
) {
  return {
    user_id: userId,
    currency: settings.currency ?? "USD",
    theme_mode: settings.themeMode ?? "system",
    billing_alert_enabled: settings.billingAlertEnabled ?? false,
    billing_alert_days: settings.billingAlertDays ?? 3,
    renewal_reminder_enabled: settings.renewalReminderEnabled ?? false,
    renewal_reminder_days: settings.renewalReminderDays ?? 1,
    custom_categories: settings.customCategories ?? [],
    has_onboarded: settings.hasOnboarded ?? false,
  };
}

// ─── Hooks ───

export function useUserSettings() {
  const { user } = useUser();
  const userId = user?.id ?? "";
  const supabaseTokenReady = useAuthTokenReady((s) => s.supabaseTokenReady);

  return useQuery({
    queryKey: ["userSettings", userId],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data ? dbRowToSettings(data) : null;
    },
    enabled: !!userId && supabaseTokenReady,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?.id ?? "";

  return useMutation({
    mutationFn: async (settings: Partial<SettingsState>) => {
      const supabase = getSupabaseClient() as any;

      // Fetch current row so we can merge — avoids overwriting with defaults
      const { data: current, error: fetchError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // Merge: defaults ← existing ← partial update
      const merged: SettingsState = {
        currency: "USD",
        themeMode: "system",
        billingAlertEnabled: false,
        billingAlertDays: 3,
        renewalReminderEnabled: false,
        renewalReminderDays: 1,
        customCategories: [],
        hasOnboarded: false,
        ...(current ? dbRowToSettings(current) : {}),
        ...settings,
      };

      const dbRow = settingsToDbRow(merged, userId);

      let error;
      if (current) {
        ({ error } = await supabase
          .from("user_settings")
          .update(dbRow)
          .eq("user_id", userId));
      } else {
        ({ error } = await supabase
          .from("user_settings")
          .insert(dbRow));
      }

      if (error) throw error;
    },
    onMutate: async (newSettings) => {
      const qk = ["userSettings", userId];
      await queryClient.cancelQueries({ queryKey: qk });
      const previous = queryClient.getQueryData(qk);
      if (previous) {
        queryClient.setQueryData(qk, { ...previous, ...newSettings });
      }
      // Sync theme to Zustand so ThemeProvider applies it immediately
      if (newSettings.themeMode) {
        useSettingsStore.getState().setThemeMode(newSettings.themeMode);
      }
      return { previous };
    },
    onError: (_err, _newSettings, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["userSettings", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings", userId] });
    },
  });
}
