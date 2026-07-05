import { icons } from "@/constants/icons";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { secureStorage } from "./storage";
import type { ImageSourcePropType } from "react-native";
import { getLogoUrl } from "./logo";

type SubscriptionPersist = Omit<Subscription, "icon"> & { icon?: null };

interface SubscriptionStore {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (subscription: Subscription) => void;
  removeSubscription: (id: string) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
}

function resolveIcon(domain?: string): ImageSourcePropType {
  if (domain) {
    return { uri: getLogoUrl(domain, 128) };
  }
  return icons.plus;
}

function restoreSubscription(sub: SubscriptionPersist): Subscription {
  return { ...sub, icon: resolveIcon(sub.domain) };
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set) => ({
      subscriptions: HOME_SUBSCRIPTIONS,
      addSubscription: (subscription) =>
        set((state) => ({ subscriptions: [subscription, ...state.subscriptions] })),
      updateSubscription: (subscription) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === subscription.id ? subscription : s,
          ),
        })),
      removeSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        })),
      setSubscriptions: (subscriptions) => set({ subscriptions }),
    }),
    {
      name: "subradar-subscriptions",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        subscriptions: state.subscriptions.map((s) => ({
          ...s,
          icon: null,
        })) as SubscriptionPersist[],
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { subscriptions?: SubscriptionPersist[] } | undefined;
        if (!persisted?.subscriptions) return currentState;
        return {
          ...currentState,
          subscriptions: persisted.subscriptions.map(restoreSubscription),
        };
      },
    },
  ),
);
