import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions, useCreateSubscription, useUpdateSubscription, useDeleteSubscription } from "@/lib/hooks/useSubscriptions";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { formatCurrency } from "@/lib/utils";
import { getExchangeRates, convertSync } from "@/lib/currency";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import { styled } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useThemeSync";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [modalKey, setModalKey] = useState(0);
  const { data: subscriptions = [], isLoading } = useSubscriptions();
  const { mutate: createSubscription } = useCreateSubscription();
  const { mutate: updateSubscription } = useUpdateSubscription();
  const { mutate: deleteSubscription } = useDeleteSubscription();
  const { data: settings } = useUserSettings();
  const currency = settings?.currency ?? "USD";
  const { isDark } = useTheme();
  const [rates, setRates] = useState<Record<string, number>>({});

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
    return subscriptions.filter((sub) => {
      const matchesSearch =
        !query ||
        sub.name.toLowerCase().includes(query) ||
        sub.category?.toLowerCase().includes(query) ||
        sub.plan?.toLowerCase().includes(query);
      const matchesCategory =
        activeCategory === "All" || sub.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [subscriptions, searchQuery, activeCategory]);

  const handleSubscriptionPress = (item: Subscription) => {
    setExpandedId((currentId) => (currentId === item.id ? null : item.id));
  };

  const handleDeleteSubscription = (id: string) => {
    deleteSubscription(id);
    setExpandedId(null);
  };

  const handleSubmitSubscription = (subscription: Subscription) => {
    if (editingSubscription) {
      updateSubscription(subscription);
      setEditingSubscription(null);
    } else {
      createSubscription(subscription);
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

  return (
    <SafeAreaView className="flex-1 bg-background pb-5">
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View className="px-5 pt-5">
            {/* Header */}
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-3xl font-sans-bold text-primary">
                Subscriptions
              </Text>
              <Pressable
                onPress={() => openModal()}
                className="size-10 items-center justify-center rounded-full bg-muted"
              >
                <Ionicons name="add" size={20} color={isDark ? "#ededed" : "#191919"} />
              </Pressable>
            </View>

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
                      : "border-border bg-card dark:bg-[#1a1a1a]",
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
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={isDark ? "#ededed" : "#191919"} />
              <Text className="mt-4 text-base font-sans-semibold text-muted-foreground">
                Loading subscriptions...
              </Text>
            </View>
          ) : subscriptions.length === 0 ? (
            <View className="items-center py-16">
              <Ionicons name="add-circle-outline" size={40} color="rgba(55, 53, 47, 0.2)" />
              <Text className="mt-4 text-base font-sans-semibold text-muted-foreground">
                No subscriptions yet.
              </Text>
              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                Tap + to add your first subscription.
              </Text>
            </View>
          ) : (
            <View className="items-center py-16">
              <Ionicons name="search-outline" size={40} color="rgba(55, 53, 47, 0.2)" />
              <Text className="mt-4 text-base font-sans-semibold text-muted-foreground">
                No subscriptions found
              </Text>
              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                Try a different search or category.
              </Text>
            </View>
          )
        }
      />

      <CreateSubscriptionModal
        key={`sub-modal-${modalKey}`}
        visible={isModalVisible}
        onClose={() => { setIsModalVisible(false); setEditingSubscription(null); }}
        onSubmit={handleSubmitSubscription}
        initialSubscription={editingSubscription ?? undefined}
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
