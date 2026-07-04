import { convertAndFormat } from "@/lib/utils";
import { getLogoUrl } from "@/lib/logo";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { getExchangeRates } from "@/lib/currency";
import { useSettingsStore } from "@/lib/settingsStore";

const UpcomingSubscriptionCard = ({
  name,
  price,
  daysLeft,
  icon,
  currency,
  color,
  domain,
}: UpcomingSubscription) => {
  const displayCurrency = useSettingsStore((s) => s.currency);
  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    getExchangeRates().then(setRates);
  }, []);

  const converted = rates
    ? (() => {
        const r = rates[currency || "USD"];
        return r ? price * r : price;
      })()
    : price;

  return (
    <View className="mr-3 w-44 rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-[#1a1a1a] p-3.5"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View className="flex-row items-start justify-between">
        <View
          className="size-10 items-center justify-center rounded-xl overflow-hidden bg-white"
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
          {convertAndFormat(price, currency || "USD", displayCurrency, rates)}
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
