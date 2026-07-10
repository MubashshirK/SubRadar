import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("subscriptions", {
      name: "Subscription Alerts",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return true;
}

export interface NotificationSettings {
  billingAlertEnabled: boolean;
  billingAlertDays: number;
  renewalReminderEnabled: boolean;
  renewalReminderDays: number;
}

function getTriggerDate(
  renewalDateStr: string,
  daysBefore: number,
): Date | null {
  const renewal = new Date(renewalDateStr);
  if (isNaN(renewal.getTime())) return null;

  const trigger = new Date(renewal);
  trigger.setDate(trigger.getDate() - daysBefore);
  trigger.setHours(9, 0, 0, 0);

  if (trigger.getTime() <= Date.now()) return null;

  return trigger;
}

export async function syncNotifications(
  subscriptions: Subscription[],
  settings: NotificationSettings,
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const active = subscriptions.filter(
    (sub) =>
      sub.status !== "cancelled" &&
      sub.renewalDate,
  );

  for (const sub of active) {
    if (settings.billingAlertEnabled && sub.renewalDate) {
      const trigger = getTriggerDate(sub.renewalDate, settings.billingAlertDays);
      if (trigger) {
        await (Notifications.scheduleNotificationAsync as any)({
          content: {
            title: "Billing Alert",
            body: `${sub.name} will be charged ${settings.billingAlertDays} day${settings.billingAlertDays > 1 ? "s" : ""} from now.`,
            data: { subscriptionId: sub.id, type: "billing_alert" },
          },
          trigger: { type: "date", date: trigger.getTime() },
          identifier: `billing_${sub.id}`,
        });
      }
    }

    if (settings.renewalReminderEnabled && sub.renewalDate) {
      const triggerDate = getTriggerDate(sub.renewalDate, settings.renewalReminderDays);
      if (triggerDate) {
        await (Notifications.scheduleNotificationAsync as any)({
          content: {
            title: "Renewal Reminder",
            body: `${sub.name} renews in ${settings.renewalReminderDays} day${settings.renewalReminderDays > 1 ? "s" : ""}.`,
            data: { subscriptionId: sub.id, type: "renewal_reminder" },
          },
          trigger: { type: "date", date: triggerDate.getTime() },
          identifier: `renewal_${sub.id}`,
        });
      }
    }
  }
}
