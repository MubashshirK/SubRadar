import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { useSettingsStore } from "@/lib/settingsStore";
import { formatCurrency } from "@/lib/utils";
import { getExchangeRates, convertSync } from "@/lib/currency";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import { styled } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const { subscriptions, addSubscription, updateSubscription, removeSubscription } = useSubscriptionStore();
  const currency = useSettingsStore((s) => s.currency);
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
    removeSubscription(id);
    setExpandedId(null);
  };

  const handleSubmitSubscription = (subscription: Subscription) => {
    if (editingSubscription) {
      updateSubscription(subscription);
      setEditingSubscription(null);
    } else {
      addSubscription(subscription);
    }
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsModalVisible(true);
    setExpandedId(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
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
                onPress={() => setIsModalVisible(true)}
                className="size-10 items-center justify-center rounded-full bg-primary"
              >
                <Ionicons name="add" size={20} color="#fff" />
              </Pressable>
            </View>

            {/* Summary */}
            <Text className="mb-5 text-sm font-sans-medium text-muted-foreground">
              {subscriptions.length} active · {formatCurrency(totalMonthly, currency)}/mo
              total
            </Text>

            {/* Search */}
            <View className="mb-4 flex-row items-center rounded-xl bg-white px-4 py-3">
              <Ionicons
                name="search-outline"
                size={18}
                color="rgba(55, 53, 47, 0.4)"
              />
              <TextInput
                className="ml-2.5 flex-1 bg-transparent text-base font-sans-medium text-primary"
                placeholder="Search subscriptions..."
                placeholderTextColor="rgba(55, 53, 47, 0.35)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color="rgba(55, 53, 47, 0.3)"
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
                      ? "border-primary bg-primary"
                      : "border-border bg-card",
                  )}
                >
                  <Text
                    className={clsx(
                      "text-sm font-sans-semibold",
                      activeCategory === item
                        ? "text-white"
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
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons
              name="search-outline"
              size={40}
              color="rgba(55, 53, 47, 0.2)"
            />
            <Text className="mt-4 text-base font-sans-semibold text-muted-foreground">
              No subscriptions found
            </Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
              Try a different search or category.
            </Text>
          </View>
        }
      />

      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => { setIsModalVisible(false); setEditingSubscription(null); }}
        onSubmit={handleSubmitSubscription}
        initialSubscription={editingSubscription ?? undefined}
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
