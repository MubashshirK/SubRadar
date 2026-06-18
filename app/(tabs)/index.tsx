import "@/global.css";
import {FlatList, Image, Text, View} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import {HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS} from "@/constants/data";
import {icons} from "@/constants/icons";
import {formatCurrency} from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import {useState} from "react";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
    const [expendedSubscriptionId, setExpendedSubscriptionId] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="home-header">
          <View className="home-user">
            <Image source={images.avatar} className="home-avatar" />
            <Text className="home-user-name">{HOME_USER.name}</Text>
          </View>

          <View className="home-add-icon-wrapper">
              <Image source={icons.add} className="home-add-icon" />
          </View>
      </View>

        <View className="home-balance-card">
            <Text className="home-balance-label">Balance</Text>

            <View className="home-balance-row">
                <Text className="home-balance-amount">
                    {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                    {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                </Text>
            </View>
        </View>

        <View>
            <ListHeading title="Upcoming" />
            <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (<UpcomingSubscriptionCard { ...item } />)}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
            />
        </View>

        <View>
            <ListHeading title="All Subscription" />
            <SubscriptionCard
                {...HOME_SUBSCRIPTIONS[0]}
                expanded={expendedSubscriptionId === HOME_SUBSCRIPTIONS[0].id}
                onPress={() => setExpendedSubscriptionId((currentId) => (currentId === HOME_SUBSCRIPTIONS[0].id ? null: HOME_SUBSCRIPTIONS[0].id))}
            />
        </View>
    </SafeAreaView>
  );
}
