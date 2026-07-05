import { getLogoUrl } from "@/lib/logo";
import {
  convertAndFormat,
  formatSubscriptionDateLong,
  getDaysUntilRenewal,
  getMonthsActive,
  getSmartStatusLabel,
} from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { getExchangeRates } from "@/lib/currency";
import { useSettingsStore } from "@/lib/settingsStore";
import { useTheme } from "@/lib/useThemeSync";

const DETAIL_ICONS = {
  payment: "card-outline" as const,
  plan: "star-outline" as const,
  started: "calendar-outline" as const,
  renewal: "refresh-outline" as const,
  monthlyEquiv: "pricetag-outline" as const,
  totalSpent: "wallet-outline" as const,
  monthsActive: "time-outline" as const,
  avgCost: "trending-down-outline" as const,
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
  onEditPress,
  onCancelPress,
  paymentMethod,
  startDate,
  status,
  domain,
}: SubscriptionCardProps) => {
  const displayCurrency = useSettingsStore((s) => s.currency);
  const { isDark } = useTheme();
  const [rates, setRates] = useState<Record<string, number>>({});
  const cardColor = color ?? "#2f6fed";
  const smartStatus = getSmartStatusLabel(status, renewalDate);
  const monthsActive = getMonthsActive(startDate);
  const daysUntilRenewal = getDaysUntilRenewal(renewalDate);
  const totalSpent = monthsActive > 0 ? monthlyEquiv * monthsActive : monthlyEquiv;
  const monthlyEquiv = billing === "Yearly" ? price / 12 : price;

  const displayMeta = category?.trim() || plan?.trim() || "";

  const imageSource = domain ? { uri: getLogoUrl(domain, 128) } : icon;

  useEffect(() => {
    getExchangeRates().then(setRates);
  }, []);

  const fmt = (value: number, subCurrency?: string) => {
    return convertAndFormat(value, subCurrency || currency || "USD", displayCurrency, rates);
  };

  // Simple expand animation
  const expandAnim = useSharedValue(0);

  useEffect(() => {
    expandAnim.value = withTiming(expanded ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [expanded, expandAnim]);

  const detailsStyle = useAnimatedStyle(() => ({
    opacity: expandAnim.value,
  }));

  // Status pill
  const statusPillClass = clsx(
    "sub-status-pill",
    smartStatus.urgency === "danger" && status !== "cancelled"
      ? "bg-destructive/10"
      : smartStatus.urgency === "warning"
        ? "sub-status-paused"
        : status === "cancelled"
          ? "sub-status-cancelled"
          : "sub-status-active",
  );

  const statusTextClass = clsx(
    "sub-status-text",
    smartStatus.urgency === "danger" && status !== "cancelled"
      ? "text-destructive"
      : smartStatus.urgency === "warning"
        ? "sub-status-paused-text"
        : status === "cancelled"
          ? "sub-status-cancelled-text"
          : "sub-status-active-text",
  );

  return (
    <Pressable
      onPress={onPress}
      className="sub-card"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {/* Collapsed Row */}
      <View className="sub-card-inner">
        {/* Icon with color ring */}
        <View
          className="sub-icon-ring"
          style={{ backgroundColor: `${cardColor}15` }}
        >
          <View className="sub-icon-bg">
            <Image
              source={imageSource}
              style={{ width: "100%", height: "100%", borderRadius: 10 }}
              contentFit="cover"
            />
          </View>
        </View>

        {/* Name + Meta */}
        <View className="ml-3 min-w-0 flex-1">
          <Text numberOfLines={1} className="sub-name">
            {name}
          </Text>
          {displayMeta || billing ? (
            <View className="sub-meta-row">
              {displayMeta ? (
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="sub-meta-text"
                >
                  {displayMeta}
                  {billing ? ` · ${billing}` : ""}
                </Text>
              ) : (
                <Text className="sub-meta-text">{billing}</Text>
              )}
            </View>
          ) : null}
        </View>

        {/* Price + Status block */}
        <View className="sub-price-block">
          <Text className="sub-price">
            {fmt(price, currency)}
            <Text className="sub-billing-label">
              {billing === "Yearly" ? "/yr" : "/mo"}
            </Text>
          </Text>
          <View className={statusPillClass}>
            <Text className={statusTextClass}>{smartStatus.label}</Text>
          </View>
        </View>
      </View>

      {/* Expanded Details */}
      {expanded && (
        <Animated.View
          style={detailsStyle}
          className="border-t border-border/40 px-4 pb-4 pt-3"
        >
          <View className="gap-4">
            {/* BILLING */}
            <View>
              <Text className="sub-section-label">Billing</Text>
              <View className="sub-detail-group">
                <View className="sub-detail-row">
                  <Ionicons
                    name={DETAIL_ICONS.payment}
                    size={18}
                    className="sub-detail-icon"
                  />
                  <Text className="sub-detail-label">Payment method</Text>
                  <Text numberOfLines={1} className="sub-detail-value">
                    {paymentMethod?.trim() || "—"}
                  </Text>
                </View>
                <View className="sub-detail-row">
                  <Ionicons
                    name={DETAIL_ICONS.plan}
                    size={18}
                    className="sub-detail-icon"
                  />
                  <Text className="sub-detail-label">Plan</Text>
                  <Text numberOfLines={1} className="sub-detail-value">
                    {plan?.trim() || "—"}
                  </Text>
                </View>
                <View className="sub-detail-row">
                  <Ionicons
                    name={DETAIL_ICONS.monthlyEquiv}
                    size={18}
                    className="sub-detail-icon"
                  />
                  <Text className="sub-detail-label">Monthly equivalent</Text>
                  <Text numberOfLines={1} className="sub-detail-value">
                    {fmt(monthlyEquiv, currency)}/mo
                  </Text>
                </View>
              </View>
            </View>

            {/* DATES */}
            <View>
              <Text className="sub-section-label">Dates</Text>
              <View className="sub-detail-group">
                <View className="sub-detail-row">
                  <Ionicons
                    name={DETAIL_ICONS.started}
                    size={18}
                    className="sub-detail-icon"
                  />
                  <Text className="sub-detail-label">Start date</Text>
                  <Text numberOfLines={1} className="sub-detail-value">
                    {formatSubscriptionDateLong(startDate)}
                  </Text>
                </View>
                <View className="sub-detail-row">
                  <Ionicons
                    name={DETAIL_ICONS.renewal}
                    size={18}
                    className="sub-detail-icon"
                  />
                  <Text className="sub-detail-label">Next renewal</Text>
                  <Text numberOfLines={1} className="sub-detail-value">
                    {formatSubscriptionDateLong(renewalDate)}
                  </Text>
                </View>
                {daysUntilRenewal !== null && (
                  <View className="sub-detail-subtext">
                    <Text
                      className={clsx(
                        "text-[11px] font-sans-medium",
                        daysUntilRenewal < 0
                          ? "text-destructive font-sans-semibold"
                          : daysUntilRenewal <= 3
                            ? "text-destructive"
                            : daysUntilRenewal <= 7
                              ? "text-amber-600"
                              : "text-success",
                      )}
                    >
                      {daysUntilRenewal < 0
                        ? `Overdue by ${Math.abs(daysUntilRenewal)} days`
                        : daysUntilRenewal === 0
                          ? "Renews today"
                          : `Renews in ${daysUntilRenewal} days`}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* SPENDING */}
            <View>
              <Text className="sub-section-label">Spending</Text>
              <View className="sub-detail-group">
                <View className="sub-detail-row">
                  <Ionicons
                    name={DETAIL_ICONS.totalSpent}
                    size={18}
                    className="sub-detail-icon"
                  />
                  <Text className="sub-detail-label">Total spent</Text>
                  <Text numberOfLines={1} className="sub-detail-value">
                    {fmt(totalSpent, currency)}
                  </Text>
                </View>
                <View className="sub-detail-row">
                  <Ionicons
                    name={DETAIL_ICONS.monthsActive}
                    size={18}
                    className="sub-detail-icon"
                  />
                  <Text className="sub-detail-label">Months active</Text>
                  <Text numberOfLines={1} className="sub-detail-value">
                    {monthsActive > 0
                      ? `${monthsActive} month${monthsActive !== 1 ? "s" : ""}`
                      : "Just started"}
                  </Text>
                </View>
                <View className="sub-detail-row">
                  <Ionicons
                    name={DETAIL_ICONS.avgCost}
                    size={18}
                    className="sub-detail-icon"
                  />
                  <Text className="sub-detail-label">Avg cost / month</Text>
                  <Text numberOfLines={1} className="sub-detail-value">
                    {fmt(monthlyEquiv, currency)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="sub-actions">
              {onEditPress && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onEditPress();
                  }}
                  className="sub-action-edit"
                >
                  <Ionicons name="pencil-outline" size={16} color={isDark ? "#ededed" : "#191919"} />
                  <Text className="sub-action-text">Edit</Text>
                </Pressable>
              )}
              {onCancelPress && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onCancelPress();
                  }}
                  className="sub-action-delete"
                >
                  <Ionicons name="trash-outline" size={16} color="#e03e3e" />
                  <Text className="sub-action-text-delete">Delete</Text>
                </Pressable>
              )}
            </View>
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;
