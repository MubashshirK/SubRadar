import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase";
import { useUser } from "@clerk/expo";
import { useSettingsStore, type SettingsState } from "@/lib/settingsStore";
import { useAuthTokenReady } from "@/lib/authStore";

// ─── Transformers ───

function dbRowToSettings(row: any): Partial<SettingsState> {
  return {
    currency: row.currency ?? "USD",
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
      const merged = {
        currency: "USD",
        customCategories: [],
        hasOnboarded: false,
        ...(current ? dbRowToSettings(current) : {}),
        ...settings,
      } as SettingsState;

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
