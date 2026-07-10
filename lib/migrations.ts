import * as SecureStore from "expo-secure-store";
import { useSubscriptionStore } from "./subscriptionStore";
import { useSettingsStore } from "./settingsStore";
import { loadSupabaseJWT, setSupabaseJWT } from "./authProvider";
import { getSupabaseClient } from "./supabase";

// ------------------------------------------------------------------
// One-time migration: detect legacy local-only data and upload to Supabase.
// Runs after Clerk JWT is available.
// ------------------------------------------------------------------

const MIGRATION_DONE_KEY = "subradar-legacy-migration-v1";

/**
 * Check if legacy local data exists and prompt to migrate.
 * Call this after initial pull from Supabase if subscriptions are empty
 * but local data exists.
 *
 * Returns true if user chose to migrate.
 */
export async function migrateLocalData(token: string): Promise<boolean> {
  try {
    const alreadyDone = await SecureStore.getItemAsync(MIGRATION_DONE_KEY);
    if (alreadyDone) return false;

    const localSubs = useSubscriptionStore.getState().subscriptions;

    // Only migrate if we have local data AND Supabase returned nothing
    if (!localSubs || localSubs.length === 0) return false;

    // Check if Supabase already has data for this user (avoider duplicates)
    await setSupabaseJWT(token);
    const supabase = getSupabaseClient();

    const { data: remoteSubs } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact" })
      .limit(1);

    if (remoteSubs && remoteSubs.length > 0) {
      // Cloud already has data — don't duplicate
      await SecureStore.setItemAsync(MIGRATION_DONE_KEY, "true");
      return false;
    }

    // Upload all local subscriptions
    const dbRows = localSubs.map((sub) => ({
      id: sub.id,
      name: sub.name,
      plan: sub.plan ?? null,
      category: sub.category ?? null,
      payment_method: sub.paymentMethod ?? null,
      status: sub.status ?? "active",
      start_date: sub.startDate ?? null,
      price: sub.price,
      currency: sub.currency ?? "USD",
      billing: sub.billing,
      renewal_date: sub.renewalDate ?? null,
      color: sub.color ?? null,
      domain: sub.domain ?? null,
    }));

    const subsTable = supabase.from("subscriptions") as any;
    const { error } = await subsTable.insert(dbRows);
    if (error) throw error;

    // Also migrate user settings
    const localSettings = useSettingsStore.getState();
    const settingsTable = supabase.from("user_settings") as any;
    const { error: settingsError } = await settingsTable.upsert(
      {
        currency: localSettings.currency,
        theme_mode: localSettings.themeMode,
        billing_alert_enabled: localSettings.billingAlertEnabled,
        billing_alert_days: localSettings.billingAlertDays,
        renewal_reminder_enabled: localSettings.renewalReminderEnabled,
        renewal_reminder_days: localSettings.renewalReminderDays,
        custom_categories: localSettings.customCategories,
        has_onboarded: localSettings.hasOnboarded,
      },
      { onConflict: "user_id" },
    );

    if (settingsError) throw settingsError;

    await SecureStore.setItemAsync(MIGRATION_DONE_KEY, "true");
    return true;
  } catch (err) {
    console.warn("[migrations] Failed to migrate local data:", err);
    return false;
  }
}
