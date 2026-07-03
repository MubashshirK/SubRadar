import { formatCurrency } from "@/lib/utils";
import { getLogoUrl } from "@/lib/logo";
import React from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";

const UpcomingSubscriptionCard = ({
  name,
  price,
  daysLeft,
  icon,
  currency,
  color,
  domain,
}: UpcomingSubscription) => {
  return (
    <View
      className="mr-3 w-44 rounded-2xl border p-3.5"
      style={{
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "rgba(55, 53, 47, 0.12)",
      }}
    >
      <View className="flex-row items-start justify-between">
        <View
          className="size-10 items-center justify-center rounded-xl overflow-hidden"
        >
          {domain ? (
            <Image
              source={getLogoUrl(domain, 128)}
              style={{ width: "100%", height: "100%", borderRadius: 8 }}
              contentFit="cover"
            />
          ) : (
            <Image source={icon} style={{ width: "100%", height: "100%", borderRadius: 8 }} contentFit="cover" />
          )}
        </View>
        <Text className="text-sm font-sans-bold text-primary">
          {formatCurrency(price, currency)}
        </Text>
      </View>

      <Text
        className="mt-3 text-base font-sans-semibold text-primary"
        numberOfLines={1}
      >
        {name}
      </Text>
      <Text className="mt-0.5 text-xs font-sans-medium text-muted-foreground">
        {daysLeft > 1 ? `${daysLeft} days left` : "Last day"}
      </Text>
    </View>
  );
};
export default UpcomingSubscriptionCard;
