import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase";
import { useUser } from "@clerk/expo";
import { icons } from "@/constants/icons";
import { getLogoUrl } from "@/lib/logo";
import { useAuthTokenReady } from "@/lib/authStore";
import type { ImageSourcePropType } from "react-native";

// ─── Transformers ───

function resolveIcon(domain?: string): ImageSourcePropType {
  if (domain) {
    return { uri: getLogoUrl(domain, 128) };
  }
  return icons.plus;
}

function subToDbRow(sub: Subscription, userId: string) {
  return {
    id: sub.id,
    user_id: userId,
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
  };
}

function dbRowToSub(row: any): Subscription {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    currency: row.currency ?? "USD",
    billing: row.billing,
    category: row.category ?? undefined,
    plan: row.plan ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
    status: row.status ?? undefined,
    startDate: row.start_date ?? undefined,
    renewalDate: row.renewal_date ?? undefined,
    color: row.color ?? undefined,
    domain: row.domain ?? undefined,
    icon: resolveIcon(row.domain),
  };
}

// ─── Query key factory ───

export const subKeys = {
  all: (userId: string) => ["subscriptions", userId] as string[],
};

// ─── Hooks ───

export function useSubscriptions() {
  const { user } = useUser();
  const userId = user?.id ?? "";
  const supabaseTokenReady = useAuthTokenReady((s) => s.supabaseTokenReady);

  return useQuery({
    queryKey: ["subscriptions", userId],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []).map(dbRowToSub) as Subscription[];
    },
    enabled: !!userId && supabaseTokenReady,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?.id ?? "";

  return useMutation({
    mutationFn: async (sub: Subscription) => {
      const supabase = getSupabaseClient() as any;
      const dbRow = subToDbRow(sub, userId);
      const { id: _id, ...insertData } = dbRow;
      const { error } = await supabase.from("subscriptions").insert(insertData);
      if (error) throw error;
    },
    onMutate: async (newSub) => {
      const qk = ["subscriptions", userId];
      await queryClient.cancelQueries({ queryKey: qk });
      const previous = queryClient.getQueryData<Subscription[]>(qk);
      queryClient.setQueryData<Subscription[]>(qk, (old = []) => [
        newSub,
        ...old,
      ]);
      return { previous };
    },
    onError: (err, _newSub, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["subscriptions", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", userId] });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?.id ?? "";

  return useMutation({
    mutationFn: async (sub: Subscription) => {
      const supabase = getSupabaseClient() as any;
      const { error } = await supabase
        .from("subscriptions")
        .update(subToDbRow(sub, userId))
        .eq("id", sub.id);
      if (error) throw error;
    },
    onMutate: async (updatedSub) => {
      const qk = ["subscriptions", userId];
      await queryClient.cancelQueries({ queryKey: qk });
      const previous = queryClient.getQueryData<Subscription[]>(qk);
      queryClient.setQueryData<Subscription[]>(qk, (old = []) =>
        old.map((s) => (s.id === updatedSub.id ? updatedSub : s)),
      );
      return { previous };
    },
    onError: (_err, _newSub, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["subscriptions", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", userId] });
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?.id ?? "";

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient() as any;
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async (deletedId) => {
      const qk = ["subscriptions", userId];
      await queryClient.cancelQueries({ queryKey: qk });
      const previous = queryClient.getQueryData<Subscription[]>(qk);
      queryClient.setQueryData<Subscription[]>(qk, (old = []) =>
        old.filter((s) => s.id !== deletedId),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["subscriptions", userId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", userId] });
    },
  });
}
