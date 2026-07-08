import ConfirmDialog from "@/components/ConfirmDialog";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import EmptyState from "@/components/EmptyState";
import ErrorBoundary from "@/components/ErrorBoundary";
import SubscriptionsSkeleton from "@/components/loading/SubscriptionsSkeleton";
import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/loading/Skeleton";
import SubscriptionCard from "@/components/SubscriptionCard";
import Toast from "@/components/Toast";
import { useSubscriptions, useCreateSubscription, useUpdateSubscription, useDeleteSubscription } from "@/lib/hooks/useSubscriptions";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { formatCurrency } from "@/lib/utils";
import { getExchangeRates, convertSync } from "@/lib/currency";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import { styled } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useThemeSync";

const SafeAreaView = styled(RNSafeAreaView);

type SortOption = "name" | "price-asc" | "price-desc" | "renewal" | "category";

const SORT_LABELS: Record<SortOption, string> = {
  "name": "Name",
  "price-asc": "Price ↑",
  "price-desc": "Price ↓",
  "renewal": "Renewal",
  "category": "Category",
};

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [modalKey, setModalKey] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { data: subscriptions = [], isPending, refetch } = useSubscriptions();
  const { mutate: createSubscription } = useCreateSubscription();
  const { mutate: updateSubscription } = useUpdateSubscription();
  const { mutate: deleteSubscription } = useDeleteSubscription();
  const { data: settings } = useUserSettings();
  const currency = settings?.currency ?? "USD";
  const { isDark } = useTheme();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  useEffect(() => {
    getExchangeRates().then(setRates);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(
      subscriptions.map((s) => s.category ?? "Other").filter(Boolean),
    );
    return ["All", ...Array.from(cats)];
  }, [subscriptions]);

  const totalMonthly = useMemo(
    () =>
      subscriptions.reduce((sum, sub) => {
        const monthly = sub.billing === "Yearly" ? sub.price / 12 : sub.price;
        return sum + convertSync(monthly, sub.currency || "USD", currency, rates);
      }, 0),
    [subscriptions, rates, currency],
  );

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filtered = subscriptions.filter((sub) => {
      const matchesSearch =
        !query ||
        sub.name.toLowerCase().includes(query) ||
        sub.category?.toLowerCase().includes(query) ||
        sub.plan?.toLowerCase().includes(query);
      const matchesCategory =
        activeCategory === "All" || sub.category === activeCategory;
      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "renewal":
          if (!a.renewalDate) return 1;
          if (!b.renewalDate) return -1;
          return new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
        case "category":
          return (a.category ?? "ZZZ").localeCompare(b.category ?? "ZZZ");
        default:
          return 0;
      }
    });
  }, [subscriptions, searchQuery, activeCategory, sortBy]);

  const handleSubscriptionPress = (item: Subscription) => {
    setExpandedId((currentId) => (currentId === item.id ? null : item.id));
  };

  const handleDeleteSubscription = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteSubscription(deleteTargetId, {
        onSuccess: () => setToast({ message: "Subscription deleted", type: "success" }),
        onError: () => setToast({ message: "Failed to delete subscription", type: "error" }),
      });
      setExpandedId(null);
    }
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  const handleSubmitSubscription = (subscription: Subscription) => {
    if (editingSubscription) {
      updateSubscription(subscription, {
        onSuccess: () => setToast({ message: "Subscription updated", type: "success" }),
        onError: () => setToast({ message: "Failed to update subscription", type: "error" }),
      });
      setEditingSubscription(null);
    } else {
      createSubscription(subscription, {
        onSuccess: () => setToast({ message: "Subscription added", type: "success" }),
        onError: () => setToast({ message: "Failed to add subscription", type: "error" }),
      });
    }
  };

  const openModal = (subscription?: Subscription) => {
    setEditingSubscription(subscription ?? null);
    setModalKey((k) => k + 1);
    setIsModalVisible(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    openModal(subscription);
    setExpandedId(null);
  };

  if (isPending) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <SubscriptionsSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
    <SafeAreaView className="flex-1 bg-background pb-5">
      <FlatList
        data={refreshing ? [] : filteredSubscriptions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View className="px-5 pt-5">
            {/* Header */}
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-display">
                Subscriptions
              </Text>
              <Pressable
                onPress={() => openModal()}
                className="size-10 items-center justify-center rounded-full bg-muted"
              >
                <Ionicons name="add" size={20} color={isDark ? "#ededed" : "#191919"} />
              </Pressable>
            </View>

            {refreshing ? (
              <View className="mt-2">
                {/* Summary skeleton */}
                <SkeletonText width={180} height={14} className="mb-5 mt-2" />
                {/* Search skeleton */}
                <View className="mb-4 flex-row items-center rounded-xl bg-muted px-4 py-3">
                  <SkeletonCircle size={18} />
                  <SkeletonText width="60%" height={16} className="ml-2.5" />
                </View>
                {/* Category filters skeleton */}
                <View className="mb-5 flex-row gap-2">
                  {[80, 60, 90, 70, 85].map((w, i) => (
                    <Skeleton key={i} width={w} height={36} borderRadius={18} />
                  ))}
                </View>
              </View>
            ) : (
              <>
                {/* Summary */}
                <Text className="mb-5 text-sm font-sans-medium text-muted-foreground">
                  {subscriptions.length} active · {formatCurrency(totalMonthly, currency)}/mo
                  total
                </Text>

                {/* Search */}
                <View className="mb-4 flex-row items-center rounded-xl bg-muted px-4 py-3">
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color={isDark ? "rgba(237, 237, 237, 0.4)" : "rgba(55, 53, 47, 0.4)"}
                  />
                  <TextInput
                    className="ml-2.5 flex-1 bg-transparent text-base font-sans-medium text-primary"
                    placeholder="Search subscriptions..."
                    placeholderTextColor={isDark ? "rgba(237, 237, 237, 0.35)" : "rgba(55, 53, 47, 0.35)"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery("")}>
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={isDark ? "rgba(237, 237, 237, 0.3)" : "rgba(55, 53, 47, 0.3)"}
                      />
                    </Pressable>
                  )}
                </View>

                {/* Sort */}
                <View className="mb-4 flex-row items-center gap-2">
                  <Ionicons name="swap-vertical" size={14} color={isDark ? "rgba(237, 237, 237, 0.4)" : "rgba(55, 53, 47, 0.4)"} />
                  <Text className="text-xs font-sans-medium text-muted-foreground">Sort:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                      <Pressable
                        key={option}
                        onPress={() => setSortBy(option)}
                        className={clsx(
                          "rounded-full border px-3 py-1.5",
                          sortBy === option
                            ? "border-primary/40 bg-primary/8 dark:border-foreground/40 dark:bg-foreground/8"
                            : "border-border bg-background",
                        )}
                      >
                        <Text
                          className={clsx(
                            "text-xs font-sans-semibold",
                            sortBy === option
                              ? "text-primary dark:text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {SORT_LABELS[option]}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Category Filters */}
                <FlatList
                  data={categories}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item}
                  contentContainerStyle={{ gap: 8 }}
                  className="mb-5"
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => setActiveCategory(item)}
                      className={clsx(
                        "rounded-full border px-4 py-2",
                        activeCategory === item
                          ? "border-primary dark:border-foreground bg-primary dark:bg-foreground"
                          : "border-border bg-card dark:bg-card",
                      )}
                    >
                      <Text
                        className={clsx(
                          "text-sm font-sans-semibold",
                          activeCategory === item
                            ? "text-white dark:text-background"
                            : "text-muted-foreground",
                        )}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  )}
                />
              </>
            )}

            {/* Skeleton cards during refresh */}
            {refreshing && (
              <View className="px-0 mt-1">
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} className="mb-3 rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-card p-4">
                    <View className="flex-row items-center py-2 pl-1 pr-2">
                      <SkeletonCircle size={52} borderRadius={14} />
                      <View className="ml-3 flex-1 gap-2">
                        <SkeletonText width="60%" height={16} />
                        <SkeletonText width="40%" height={12} />
                      </View>
                      <View className="items-end gap-1.5">
                        <SkeletonText width={60} height={14} />
                        <Skeleton width={50} height={20} borderRadius={10} />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-5">
            <SubscriptionCard
              {...item}
              expanded={expandedId === item.id}
              onPress={() => handleSubscriptionPress(item)}
              onEditPress={() => handleEditSubscription(item)}
              onCancelPress={() => handleDeleteSubscription(item.id)}
            />
          </View>
        )}
        extraData={expandedId}
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          refreshing ? null : subscriptions.length === 0 ? (
            <EmptyState
              icon="wallet-outline"
              title="No subscriptions yet"
              description="Tap the button below to add your first subscription."
              ctaLabel="Add Subscription"
              onCtaPress={() => openModal()}
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title="No subscriptions found"
              description="Try a different search or category."
              ctaLabel="Clear Filters"
              onCtaPress={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="transparent"
            colors={["transparent"]}
          />
        }
      />

      <CreateSubscriptionModal
        key={`sub-modal-${modalKey}`}
        visible={isModalVisible}
        onClose={() => { setIsModalVisible(false); setEditingSubscription(null); }}
        onSubmit={handleSubmitSubscription}
        initialSubscription={editingSubscription ?? undefined}
      />

      <ConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); }}
        onConfirm={confirmDelete}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription? This action cannot be undone."
        confirmLabel="Delete"
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </SafeAreaView>
    </ErrorBoundary>
  );
};

export default Subscriptions;
