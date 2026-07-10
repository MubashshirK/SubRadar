import { useEffect, useRef } from "react";
import { useSubscriptions } from "./useSubscriptions";
import { useSettingsStore } from "@/lib/settingsStore";
import { syncNotifications } from "@/lib/notificationManager";

export function useNotificationSync() {
  const { data: subscriptions } = useSubscriptions();
  const billingAlertEnabled = useSettingsStore((s) => s.billingAlertEnabled);
  const billingAlertDays = useSettingsStore((s) => s.billingAlertDays);
  const renewalReminderEnabled = useSettingsStore((s) => s.renewalReminderEnabled);
  const renewalReminderDays = useSettingsStore((s) => s.renewalReminderDays);
  const initiated = useRef(false);

  useEffect(() => {
    if (!subscriptions) return;
    if (!initiated.current) {
      initiated.current = true;
    }

    syncNotifications(subscriptions ?? [], {
      billingAlertEnabled,
      billingAlertDays,
      renewalReminderEnabled,
      renewalReminderDays,
    });
  }, [
    subscriptions,
    billingAlertEnabled,
    billingAlertDays,
    renewalReminderEnabled,
    renewalReminderDays,
  ]);
}
