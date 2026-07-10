import { create } from "zustand";

interface SubscriptionStore {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (subscription: Subscription) => void;
  removeSubscription: (id: string) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  clearSubscriptions: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  (set) => ({
    subscriptions: [],

    addSubscription: (subscription) => {
      set((state) => ({
        subscriptions: [subscription, ...state.subscriptions],
      }));
    },

    updateSubscription: (subscription) => {
      set((state) => ({
        subscriptions: state.subscriptions.map((s) =>
          s.id === subscription.id ? subscription : s,
        ),
      }));
    },

    removeSubscription: (id) => {
      set((state) => ({
        subscriptions: state.subscriptions.filter((s) => s.id !== id),
      }));
    },

    setSubscriptions: (subscriptions) => set({ subscriptions }),

    clearSubscriptions: () => set({ subscriptions: [] }),
  }),
);
