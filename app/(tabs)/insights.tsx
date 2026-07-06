import { convertSync, getExchangeRates } from "@/lib/currency";
import { getLogoUrl } from "@/lib/logo";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { useSubscriptions } from "@/lib/hooks/useSubscriptions";
import { formatCurrency } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import { Image } from "expo-image";
import { styled } from "nativewind";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

type Period = "monthly" | "yearly";

const CATEGORY_COLORS: Record<string, string> = {
  Design: "#2f6fed",
  "AI Tools": "#0f7b6c",
  "Developer Tools": "#8b5cf6",
};

const FALLBACK_COLORS = ["#e03e3e", "#ea7a53", "#d97706", "#6366f1"];

function getCategoryColor(category: string, index: number): string {
  return (
    CATEGORY_COLORS[category] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
  );
}

function useAnimatedNumber(target: number, duration = 800) {
  const [displayed, setDisplayed] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(eased * target);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return displayed;
}

const Insights = () => {
  const { data: subscriptions = [], isLoading } = useSubscriptions();
  const { data: settings } = useUserSettings();
  const currency = settings?.currency ?? "USD";
  const [period, setPeriod] = useState<Period>("monthly");
  const [rates, setRates] = useState<Record<string, number>>({});

  const pillWidth = useSharedValue(0);
  const pillTranslateX = useSharedValue(0);
  const monthlyRef = useRef<View>(null);
  const yearlyRef = useRef<View>(null);
  const measuresRef = useRef({
    monthly: { x: 0, w: 0 },
    yearly: { x: 0, w: 0 },
  });

  const handlePeriodChange = useCallback(
    (p: Period) => {
      setPeriod(p);
      const m = measuresRef.current[p];
      if (m && m.w > 0) {
        const SPRING = { damping: 100, stiffness: 1800 };
        pillWidth.value = withSpring(m.w, SPRING);
        pillTranslateX.value = withSpring(m.x, SPRING);
      }
    },
    [pillWidth, pillTranslateX],
  );

  const handleMonthlyLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      measuresRef.current.monthly = { x, w: width };
      if (period === "monthly") {
        pillWidth.value = width;
        pillTranslateX.value = x;
      }
    },
    [period, pillWidth, pillTranslateX],
  );

  const handleYearlyLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      measuresRef.current.yearly = { x, w: width };
      if (period === "yearly") {
        pillWidth.value = width;
        pillTranslateX.value = x;
      }
    },
    [period, pillWidth, pillTranslateX],
  );

  useEffect(() => {
    getExchangeRates().then(setRates);
  }, []);

  const fmt = useCallback((value: number) => formatCurrency(value, currency), [currency]);

  const monthlyTotal = useMemo(() => {
    return subscriptions.reduce((sum, sub) => {
      const monthly = sub.billing === "Yearly" ? sub.price / 12 : sub.price;
      return sum + convertSync(monthly, sub.currency || "USD", currency, rates);
    }, 0);
  }, [subscriptions, rates, currency]);

  const yearlyTotal = useMemo(() => {
    return subscriptions.reduce((sum, sub) => {
      const annual = sub.billing === "Yearly" ? sub.price : sub.price * 12;
      return sum + convertSync(annual, sub.currency || "USD", currency, rates);
    }, 0);
  }, [subscriptions, rates, currency]);

  const activeSubCount = useMemo(
    () => subscriptions.filter((s) => s.status === "active").length,
    [subscriptions],
  );

  const currentTotal = period === "monthly" ? monthlyTotal : yearlyTotal;
  const avgPerSub = activeSubCount > 0 ? monthlyTotal / activeSubCount : 0;
  const animatedTotal = useAnimatedNumber(currentTotal, 900);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const sub of subscriptions) {
      const monthly = sub.billing === "Yearly" ? sub.price / 12 : sub.price;
      const converted = convertSync(
        monthly,
        sub.currency || "USD",
        currency,
        rates,
      );
      map.set(
        sub.category ?? "Other",
        (map.get(sub.category ?? "Other") ?? 0) + converted,
      );
    }
    const max = Math.max(...map.values(), 1);
    return Array.from(map.entries())
      .map(([category, total], i) => ({
        category,
        total,
        yearlyTotal: total * 12,
        percentage:
          monthlyTotal > 0 ? Math.round((total / monthlyTotal) * 100) : 0,
        barWidth: total / max,
        color: getCategoryColor(category, i),
      }))
      .sort((a, b) => b.total - a.total);
  }, [subscriptions, monthlyTotal, rates, currency]);

  const topSubscriptions = useMemo(() => {
    const converted = subscriptions.map((sub) => {
      const monthlyCost = sub.billing === "Yearly" ? sub.price / 12 : sub.price;
      const convertedMonthly = convertSync(
        monthlyCost,
        sub.currency || "USD",
        currency,
        rates,
      );
      const yearlyCost = sub.billing === "Yearly" ? sub.price : sub.price * 12;
      const convertedYearly = convertSync(
        yearlyCost,
        sub.currency || "USD",
        currency,
        rates,
      );
      return {
        ...sub,
        monthlyCost: convertedMonthly,
        convertedMonthly,
        yearlyCost: convertedYearly,
        convertedYearly,
      };
    });
    const max = Math.max(...converted.map((s) => s.convertedMonthly), 1);
    return converted
      .sort((a, b) => b.convertedMonthly - a.convertedMonthly)
      .map((sub) => ({
        ...sub,
        barWidth: sub.convertedMonthly / max,
      }));
  }, [subscriptions, rates, currency]);

  const billingBreakdown = useMemo(() => {
    let monthlyCount = 0;
    let yearlyCount = 0;
    let monthlyCost = 0;
    let yearlyCost = 0;
    for (const sub of subscriptions) {
      if (sub.billing === "Yearly") {
        yearlyCount++;
        yearlyCost += convertSync(
          sub.price,
          sub.currency || "USD",
          currency,
          rates,
        );
      } else {
        monthlyCount++;
        monthlyCost += convertSync(
          sub.price,
          sub.currency || "USD",
          currency,
          rates,
        );
      }
    }
    return {
      monthly: { count: monthlyCount, total: monthlyCost },
      yearly: {
        count: yearlyCount,
        total: yearlyCost,
        monthlyEquiv: yearlyCost / 12,
      },
    };
  }, [subscriptions, rates, currency]);

  const smartInsight = useMemo(() => {
    if (categoryBreakdown.length === 0) return null;
    const topCat = categoryBreakdown[0];
    if (topSubscriptions.length === 0) return null;
    const topSub = topSubscriptions[0];
    const topSubPct = Math.round((topSub.monthlyCost / monthlyTotal) * 100);

    if (topCat.percentage >= 60) {
      return `${topCat.category} tools account for ${topCat.percentage}% of your monthly spend — that's ${fmt(topCat.total)}/mo.`;
    }
    if (topSubPct >= 50) {
      return `${topSub.name} is your biggest expense at ${fmt(topSub.monthlyCost)}/mo — ${topSubPct}% of your total.`;
    }
    return `You're spreading your ${fmt(monthlyTotal)}/mo across ${categoryBreakdown.length} categories. The biggest is ${topCat.category}.`;
  }, [categoryBreakdown, topSubscriptions, monthlyTotal, fmt]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background p-5 pb-5">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#191919" />
          <Text className="mt-4 text-lg font-sans-semibold text-muted-foreground text-center">
            Loading insights...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background p-5 pb-5">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
          <Text className="mt-4 text-lg font-sans-semibold text-muted-foreground text-center">
            No subscriptions to analyze.
          </Text>
          <Text className="mt-2 text-base font-sans-medium text-muted-foreground text-center">
            Add subscriptions to see your spending insights.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background pb-5">
      <ScrollView
        contentContainerClassName="px-5 pt-5 pb-30"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-3xl font-sans-bold text-primary">Insights</Text>

          <View
            className="flex-row rounded-full bg-white dark:bg-[#1a1a1a] p-0.5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Animated.View
              className="absolute rounded-full bg-primary inset-y-0.5"
              style={{
                width: pillWidth,
                transform: [{ translateX: pillTranslateX }],
              }}
            />
            <Pressable
              onPress={() => handlePeriodChange("monthly")}
              onLayout={handleMonthlyLayout}
              ref={monthlyRef}
              className="rounded-full px-4 py-2"
            >
              <Text
                className={clsx(
                  "text-sm font-sans-semibold",
                  period === "monthly"
                    ? "text-white dark:text-black"
                    : "text-muted-foreground",
                )}
              >
                Monthly
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handlePeriodChange("yearly")}
              onLayout={handleYearlyLayout}
              ref={yearlyRef}
              className="rounded-full px-4 py-2"
            >
              <Text
                className={clsx(
                  "text-sm font-sans-semibold",
                  period === "yearly"
                    ? "text-white dark:text-black"
                    : "text-muted-foreground",
                )}
              >
                Yearly
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Hero Metric */}
        <View className="mt-6 items-center pb-8">
          <Text className="text-base font-sans-medium text-muted-foreground">
            {period === "monthly" ? "Monthly Spending" : "Yearly Spending"}
          </Text>
          <Text
            className="mt-2 text-5xl font-sans-extrabold text-primary tracking-tight"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {fmt(animatedTotal)}
          </Text>
          <View className="mt-3 flex-row items-center gap-2">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              {activeSubCount} subs
            </Text>
            <Text className="text-sm font-sans-medium text-muted-foreground">
              ·
            </Text>
            <Text className="text-sm font-sans-medium text-muted-foreground">
              {fmt(avgPerSub)} avg
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View className="mb-8 flex-row gap-3">
          <View
            className="flex-1 items-center rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-[#1a1a1a] p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Text className="text-xs font-sans-medium text-muted-foreground">
              Yearly
            </Text>
            <Text
              className="mt-1 text-lg font-sans-bold text-primary"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatCurrency(yearlyTotal, currency, 0)}
            </Text>
          </View>
          <View
            className="flex-1 items-center rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-[#1a1a1a] p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Text className="text-xs font-sans-medium text-muted-foreground">
              Active
            </Text>
            <Text className="mt-1 text-lg font-sans-bold text-primary">
              {activeSubCount}
            </Text>
          </View>
          <View
            className="flex-1 items-center rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-[#1a1a1a] p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Text className="text-xs font-sans-medium text-muted-foreground">
              Top Category
            </Text>
            <Text
              className="mt-1 text-lg font-sans-bold text-primary"
              numberOfLines={1}
            >
              {categoryBreakdown[0]?.category ?? "—"}
            </Text>
          </View>
        </View>

        {/* Category Breakdown */}
        <Text className="mb-4 text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground">
          Spending by Category
        </Text>
        <View className="mb-8 gap-4">
          {categoryBreakdown.map((cat) => {
            const displayCost =
              period === "monthly" ? cat.total : cat.yearlyTotal;
            return (
              <View key={cat.category}>
                <View className="mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <Text className="text-base font-sans-semibold text-primary">
                      {cat.category}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-sm font-sans-medium text-muted-foreground">
                      {cat.percentage}%
                    </Text>
                    <Text className="text-base font-sans-bold text-primary min-w-[72] text-right">
                      {fmt(displayCost)}
                    </Text>
                  </View>
                </View>
                <View className="h-2 rounded-full bg-muted">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${cat.barWidth * 100}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Top Subscriptions */}
        <Text className="mb-4 text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground">
          Top Subscriptions
        </Text>
        <View className="mb-8 gap-4">
          {topSubscriptions.map((sub, i) => {
            const displayCost =
              period === "monthly" ? sub.convertedMonthly : sub.convertedYearly;
            return (
              <View key={sub.id}>
                <View className="mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Text className="w-6 text-base font-sans-bold text-muted-foreground text-center">
                      #{i + 1}
                    </Text>
                    {sub.domain ? (
                      <Image
                        source={getLogoUrl(sub.domain, 128)}
                        style={{ width: 32, height: 32, borderRadius: 8 }}
                        contentFit="cover"
                      />
                    ) : (
                      <Image
                        source={sub.icon}
                        style={{ width: 32, height: 32, borderRadius: 8 }}
                        contentFit="cover"
                      />
                    )}
                    <Text className="text-base font-sans-semibold text-primary">
                      {sub.name}
                    </Text>
                  </View>
                  <Text className="text-base font-sans-bold text-primary">
                    {fmt(displayCost)}
                    <Text className="text-sm font-sans-medium text-muted-foreground">
                      /{period === "monthly" ? "mo" : "yr"}
                    </Text>
                  </Text>
                </View>
                <View className="h-1.5 rounded-full bg-muted">
                  <View
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${sub.barWidth * 100}%` }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Billing Breakdown */}
        <Text className="mb-4 text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground">
          Billing Overview
        </Text>
        <View className="mb-8 flex-row gap-3">
          <View
            className="flex-1 rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-[#1a1a1a] p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <View className="mb-3 flex-row items-center gap-2">
              <Ionicons name="repeat-outline" size={16} color="#2f6fed" />
              <Text className="text-xs font-sans-semibold text-muted-foreground">
                Monthly
              </Text>
            </View>
            <Text className="text-2xl font-sans-bold text-primary">
              {billingBreakdown.monthly.count}
            </Text>
            <Text className="mt-1 text-xs font-sans-medium text-muted-foreground">
              subscriptions
            </Text>
            <Text className="mt-3 text-base font-sans-bold text-primary">
              {fmt(billingBreakdown.monthly.total)}
              <Text className="text-xs font-sans-medium text-muted-foreground">
                /mo
              </Text>
            </Text>
          </View>
          <View
            className="flex-1 rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-[#1a1a1a] p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <View className="mb-3 flex-row items-center gap-2">
              <Ionicons name="calendar-outline" size={16} color="#0f7b6c" />
              <Text className="text-xs font-sans-semibold text-muted-foreground">
                Yearly
              </Text>
            </View>
            <Text className="text-2xl font-sans-bold text-primary">
              {billingBreakdown.yearly.count}
            </Text>
            <Text className="mt-1 text-xs font-sans-medium text-muted-foreground">
              subscriptions
            </Text>
            <Text className="mt-3 text-base font-sans-bold text-primary">
              {fmt(billingBreakdown.yearly.total)}
              <Text className="text-xs font-sans-medium text-muted-foreground">
                /yr
              </Text>
            </Text>
            <Text className="mt-1 text-xs font-sans-medium text-muted-foreground">
              ({fmt(billingBreakdown.yearly.monthlyEquiv)}/mo equiv)
            </Text>
          </View>
        </View>

        {/* Smart Insight */}
        {smartInsight && (
          <View
            className="mb-6 flex-row gap-3 rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-[#1a1a1a] p-5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <View className="mt-0.5 h-5 w-1 rounded-full bg-accent" />
            <View className="flex-1">
              <Text className="text-xs font-sans-semibold uppercase tracking-wider text-accent mb-2">
                Insight
              </Text>
              <Text className="text-base font-sans-medium text-primary leading-5">
                {smartInsight}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
