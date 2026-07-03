import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  active: "#16a34a",
  paused: "#d97706",
  cancelled: "#dc2626",
};

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  renewalDate,
  expanded,
  onPress,
  paymentMethod,
  startDate,
  status,
}: SubscriptionCardProps) => {
  const statusColor = STATUS_COLORS[status ?? "active"] ?? "#16a34a";
  const displayMeta = category?.trim() || plan?.trim() || "";

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-2xl"
      style={{
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: expanded ? "rgba(47, 111, 237, 0.3)" : "rgba(55, 53, 47, 0.12)",
        borderLeftWidth: expanded ? 3 : 1,
        borderLeftColor: expanded ? (color ?? "#2f6fed") : "rgba(55, 53, 47, 0.12)",
      }}
    >
      {/* Main Row */}
      <View className="flex-row items-center p-4">
        {/* Icon */}
        <View
          className="size-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: color ? `${color}22` : "#f7f6f3" }}
        >
          <Image source={icon} className="size-8" resizeMode="contain" />
        </View>

        {/* Copy */}
        <View className="ml-3 min-w-0 flex-1">
          <Text
            numberOfLines={1}
            className="text-base font-sans-bold text-primary"
          >
            {name}
          </Text>
          {displayMeta ? (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="mt-0.5 text-sm font-sans-medium text-muted-foreground"
            >
              {displayMeta}
              {billing ? ` · ${billing}` : ""}
            </Text>
          ) : billing ? (
            <Text className="mt-0.5 text-sm font-sans-medium text-muted-foreground">
              {billing}
            </Text>
          ) : null}
        </View>

        {/* Price + Status */}
        <View className="ml-3 items-end">
          <Text className="text-base font-sans-bold text-primary">
            {formatCurrency(price, currency)}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <View
              className="size-1.5 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            <Text className="text-xs font-sans-semibold text-muted-foreground">
              {formatStatusLabel(status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Expanded Details */}
      {expanded && (
        <View className="border-t border-border/60 px-4 pb-4 pt-3">
          <View className="gap-3">
            {[
              { label: "Payment", value: paymentMethod },
              { label: "Category", value: category },
              { label: "Plan", value: plan },
              { label: "Started", value: startDate },
              { label: "Renewal", value: renewalDate },
              { label: "Status", value: status },
            ].map(({ label, value }) => {
              const isDate = label === "Started" || label === "Renewal";
              const displayValue = isDate
                ? formatSubscriptionDateTime(value)
                : value?.trim() || "—";
              return (
                <View
                  key={label}
                  className="flex-row items-center justify-between"
                >
                  <Text className="text-sm font-sans-medium text-muted-foreground">
                    {label}
                  </Text>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="ml-4 max-w-[60%] text-right text-sm font-sans-semibold text-primary"
                  >
                    {label === "Status"
                      ? formatStatusLabel(displayValue)
                      : displayValue}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;
