import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE } from "@/constants/data";
import images from "@/constants/images";
import "@/global.css";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { subscriptions, addSubscription } = useSubscriptionStore();

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
      }));
  }, [subscriptions]);

  const handleSubscriptionPress = (item: Subscription) => {
    setExpandedSubscriptionId((currentId) =>
      currentId === item.id ? null : item.id,
    );
  };

  const handleCreateSubscription = (newSubscription: Subscription) => {
    addSubscription(newSubscription);
  };

  // Get user display name: firstName, fullName, or email
  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";

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
                onPress={() => setIsModalVisible(true)}
                className="size-10 items-center justify-center rounded-full bg-primary"
              >
                <Ionicons name="add" size={20} color="#fff" />
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
                <Text className="home-balance-amount">
                  {formatCurrency(
                    subscriptions.reduce(
                      (sum, sub) =>
                        sum +
                        (sub.billing === "Yearly" ? sub.price / 12 : sub.price),
                      0,
                    ),
                  )}
                </Text>
                <View className="items-end">
                  <Text className="home-balance-date">
                    {dayjs(
                      subscriptions
                        .filter((s) => s.renewalDate)
                        .sort((a, b) =>
                          dayjs(a.renewalDate!).diff(dayjs(b.renewalDate!)),
                        )[0]?.renewalDate ?? HOME_BALANCE.nextRenewalDate,
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
                      ? formatCurrency(
                          subscriptions.reduce(
                            (sum, sub) =>
                              sum +
                              (sub.billing === "Yearly"
                                ? sub.price / 12
                                : sub.price),
                            0,
                          ) / subscriptions.length,
                        )
                      : "$0.00"}
                  </Text>
                  <Text className="home-balance-stat-label">Avg / sub</Text>
                </View>
                <View className="home-balance-stat">
                  <Text className="home-balance-stat-value">
                    {formatCurrency(
                      subscriptions.reduce(
                        (sum, sub) =>
                          sum +
                          (sub.billing === "Yearly"
                            ? sub.price
                            : sub.price * 12),
                        0,
                      ),
                    )}
                  </Text>
                  <Text className="home-balance-stat-label">Yearly</Text>
                </View>
              </View>
            </LinearGradient>

            <View className="mb-5">
              <View className="my-5 flex-row items-center justify-between">
                <Text className="text-2xl font-sans-bold text-primary">
                  Upcoming
                </Text>
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  {formatCurrency(
                    subscriptions.reduce(
                      (sum, sub) =>
                        sum +
                        (sub.billing === "Yearly" ? sub.price / 12 : sub.price),
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
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        contentContainerClassName="pb-30"
      />

      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateSubscription}
      />
    </SafeAreaView>
  );
}
