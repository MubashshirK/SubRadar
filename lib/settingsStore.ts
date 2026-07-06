import { create } from "zustand";

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar", flag: "🇺🇸", region: "Americas" as const },
  { code: "CAD", symbol: "CA$", label: "Canadian Dollar", flag: "🇨🇦", region: "Americas" as const },
  { code: "MXN", symbol: "MX$", label: "Mexican Peso", flag: "🇲🇽", region: "Americas" as const },
  { code: "BRL", symbol: "R$", label: "Brazilian Real", flag: "🇧🇷", region: "Americas" as const },
  { code: "EUR", symbol: "€", label: "Euro", flag: "🇪🇺", region: "Europe" as const },
  { code: "GBP", symbol: "£", label: "British Pound", flag: "🇬🇧", region: "Europe" as const },
  { code: "CHF", symbol: "CHF", label: "Swiss Franc", flag: "🇨🇭", region: "Europe" as const },
  { code: "SEK", symbol: "kr", label: "Swedish Krona", flag: "🇸🇪", region: "Europe" as const },
  { code: "INR", symbol: "₹", label: "Indian Rupee", flag: "🇮🇳", region: "Asia Pacific" as const },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan", flag: "🇨🇳", region: "Asia Pacific" as const },
  { code: "JPY", symbol: "¥", label: "Japanese Yen", flag: "🇯🇵", region: "Asia Pacific" as const },
  { code: "KRW", symbol: "₩", label: "South Korean Won", flag: "🇰🇷", region: "Asia Pacific" as const },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar", flag: "🇸🇬", region: "Asia Pacific" as const },
  { code: "AUD", symbol: "A$", label: "Australian Dollar", flag: "🇦🇺", region: "Asia Pacific" as const },
  { code: "AED", symbol: "AED", label: "UAE Dirham", flag: "🇦🇪", region: "Middle East" as const },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
export type CurrencyEntry = (typeof CURRENCIES)[number];

export const DEFAULT_CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud Storage",
  "Music",
  "Video",
  "News",
  "Gaming",
  "Education",
  "Finance",
  "Shopping",
  "Communication",
  "Security",
  "Other",
] as const;

export type ServiceCategory = typeof DEFAULT_CATEGORIES[number];

export type ThemeMode = "system" | "light" | "dark";

export interface SettingsState {
  currency: CurrencyCode;
  themeMode: ThemeMode;
  billingAlertEnabled: boolean;
  billingAlertDays: number;
  renewalReminderEnabled: boolean;
  renewalReminderDays: number;
  customCategories: string[];
  hasOnboarded: boolean;

  setCurrency: (currency: CurrencyCode) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setBillingAlertEnabled: (enabled: boolean) => void;
  setBillingAlertDays: (days: number) => void;
  setRenewalReminderEnabled: (enabled: boolean) => void;
  setRenewalReminderDays: (days: number) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  setOnboarded: () => void;
  importSettings: (settings: Partial<SettingsState>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  (set) => ({
    currency: "USD",
    themeMode: "system",
    billingAlertEnabled: false,
    billingAlertDays: 3,
    renewalReminderEnabled: false,
    renewalReminderDays: 1,
    customCategories: [],
    hasOnboarded: false,

    setCurrency: (currency) => set({ currency }),
    setThemeMode: (themeMode) => set({ themeMode }),
    setBillingAlertEnabled: (billingAlertEnabled) =>
      set({ billingAlertEnabled }),
    setBillingAlertDays: (billingAlertDays) => set({ billingAlertDays }),
    setRenewalReminderEnabled: (renewalReminderEnabled) =>
      set({ renewalReminderEnabled }),
    setRenewalReminderDays: (renewalReminderDays) =>
      set({ renewalReminderDays }),
    addCategory: (category) =>
      set((state) => ({
        customCategories: [...state.customCategories, category],
      })),
    removeCategory: (category) =>
      set((state) => ({
        customCategories: state.customCategories.filter((c) => c !== category),
      })),
    setOnboarded: () => set({ hasOnboarded: true }),

    importSettings: (settings) =>
      set((state) => ({
        ...state,
        ...settings,
      })),

    resetSettings: () =>
      set({
        currency: "USD",
        themeMode: "system",
        billingAlertEnabled: false,
        billingAlertDays: 3,
        renewalReminderEnabled: false,
        renewalReminderDays: 1,
        customCategories: [],
        hasOnboarded: false,
      }),
  }),
);

export const ALL_CATEGORIES = [
  ...DEFAULT_CATEGORIES,
  ...useSettingsStore.getState().customCategories,
];
