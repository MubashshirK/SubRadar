import ConfirmDialog from "@/components/ConfirmDialog";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import HomeSkeleton from "@/components/loading/HomeSkeleton";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import images from "@/constants/images";
import "@/global.css";
import { useSubscriptions, useCreateSubscription, useUpdateSubscription, useDeleteSubscription } from "@/lib/hooks/useSubscriptions";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { formatCurrency } from "@/lib/utils";
import { getExchangeRates, convertSync } from "@/lib/currency";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { styled } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useThemeSync";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const { data: settings } = useUserSettings();
  const currency = settings?.currency ?? "USD";
  const { isDark } = useTheme();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [modalKey, setModalKey] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { data: subscriptions = [], isPending } = useSubscriptions();
  const { mutate: createSubscription } = useCreateSubscription();
  const { mutate: updateSubscription } = useUpdateSubscription();
  const { mutate: deleteSubscription } = useDeleteSubscription();

  useEffect(() => {
    getExchangeRates().then((r) => {
      setRates(r);
      setRatesLoaded(true);
    });
  }, []);

  const fmt = (value: number) => formatCurrency(value, currency);

  // Get upcoming subscriptions (active subscriptions with renewal date within next 7 days)
  const upcomingSubscriptions = useMemo(() => {
    const now = dayjs();
    const nextWeek = now.add(7, "days");
    return subscriptions
      .filter(
        (sub) =>
          sub.status === "active" &&
          !!sub.renewalDate &&
          dayjs(sub.renewalDate).isAfter(now) &&
          dayjs(sub.renewalDate).isBefore(nextWeek),
      )
      .sort((a, b) => dayjs(a.renewalDate!).diff(dayjs(b.renewalDate!)))
      .map((sub) => ({
        id: sub.id,
        icon: sub.icon,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        daysLeft: dayjs(sub.renewalDate!).diff(now, "day"),
        color: sub.color,
        domain: sub.domain,
      }));
  }, [subscriptions]);

  const handleSubscriptionPress = (item: Subscription) => {
    setExpandedSubscriptionId((currentId) =>
      currentId === item.id ? null : item.id,
    );
  };

  const handleCreateSubscription = (newSubscription: Subscription) => {
    if (editingSubscription) {
      updateSubscription(newSubscription);
      setEditingSubscription(null);
    } else {
      createSubscription(newSubscription);
    }
  };

  const openModal = (subscription?: Subscription) => {
    setEditingSubscription(subscription ?? null);
    setModalKey((k) => k + 1);
    setIsModalVisible(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    openModal(subscription);
    setExpandedSubscriptionId(null);
  };

  const handleDeleteSubscription = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteSubscription(deleteTargetId);
      setExpandedSubscriptionId(null);
    }
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  // Get user display name: firstName, fullName, or email
  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";

  if (isPending) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>

              <Pressable
                onPress={() => openModal()}
                className="size-10 items-center justify-center rounded-full bg-muted"
              >
                <Ionicons name="add" size={20} color={isDark ? "#ededed" : "#191919"} />
              </Pressable>
            </View>

            <LinearGradient
              colors={["#1a1a2e", "#16213e", "#0f3460"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="my-2.5 justify-between gap-4 p-6"
              style={{ minHeight: 200, borderRadius: 24 }}
            >
              <Text className="home-balance-label">Monthly Spend</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount" numberOfLines={1} adjustsFontSizeToFit>
                  {fmt(
                    subscriptions.reduce(
                      (sum, sub) => {
                        const monthly = sub.billing === "Yearly" ? sub.price / 12 : sub.price;
                        return sum + convertSync(monthly, sub.currency || "USD", currency, rates);
                      },
                      0,
                    ),
                  )}
                </Text>
                <View className="items-end">
                  <Text className="home-balance-date">
                    {dayjs(
                      subscriptions
                        .filter(
                          (s) =>
                            s.renewalDate &&
                            dayjs(s.renewalDate).isAfter(dayjs()),
                        )
                        .sort((a, b) =>
                          dayjs(a.renewalDate!).diff(dayjs(b.renewalDate!)),
                        )[0]?.renewalDate ?? dayjs().add(1, "month").toISOString(),
                    ).format("MMM D")}
                  </Text>
                  <Text className="home-balance-date-label">Next renewal</Text>
                </View>
              </View>

              <View className="home-balance-stats">
                <View className="home-balance-stat">
                  <Text className="home-balance-stat-value">
                    {subscriptions.length}
                  </Text>
                  <Text className="home-balance-stat-label">Active</Text>
                </View>
                <View className="home-balance-stat">
                  <Text className="home-balance-stat-value">
                    {subscriptions.length > 0
                      ? fmt(
                          subscriptions.reduce(
                            (sum, sub) => {
                              const monthly = sub.billing === "Yearly" ? sub.price / 12 : sub.price;
                              return sum + convertSync(monthly, sub.currency || "USD", currency, rates);
                            },
                            0,
                          ) / subscriptions.length,
                        )
                      : ratesLoaded ? fmt(0) : "—"}
                  </Text>
                  <Text className="home-balance-stat-label">Avg / sub</Text>
                </View>
                <View className="home-balance-stat">
                  <Text className="home-balance-stat-value">
                    {fmt(
                      subscriptions.reduce(
                        (sum, sub) => {
                          const annual = sub.billing === "Yearly" ? sub.price : sub.price * 12;
                          return sum + convertSync(annual, sub.currency || "USD", currency, rates);
                        },
                        0,
                      ),
                    )}
                  </Text>
                  <Text className="home-balance-stat-label">Yearly</Text>
                </View>
              </View>
            </LinearGradient>

            <View className="mb-4">
              <View className="my-4 flex-row items-center justify-between">
                <Text className="text-2xl font-sans-bold text-primary">
                  Upcoming
                </Text>
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  {fmt(
                    subscriptions.reduce(
                      (sum, sub) => {
                        const monthly = sub.billing === "Yearly" ? sub.price / 12 : sub.price;
                        return sum + convertSync(monthly, sub.currency || "USD", currency, rates);
                      },
                      0,
                    ),
                  )}
                  /mo · {subscriptions.length} subs
                </Text>
              </View>

              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => handleSubscriptionPress(item)}
            onEditPress={() => handleEditSubscription(item)}
            onCancelPress={() => handleDeleteSubscription(item.id)}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
      />

      <CreateSubscriptionModal
        key={`sub-modal-${modalKey}`}
        visible={isModalVisible}
        onClose={() => { setIsModalVisible(false); setEditingSubscription(null); }}
        onSubmit={handleCreateSubscription}
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
    </SafeAreaView>
  );
}