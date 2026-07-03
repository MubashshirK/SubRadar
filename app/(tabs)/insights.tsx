import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { formatCurrency } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";

const SafeAreaView = styled(RNSafeAreaView);

type Period = "monthly" | "yearly";

const CATEGORY_COLORS: Record<string, string> = {
  Design: "#2f6fed",
  "AI Tools": "#0f7b6c",
  "Developer Tools": "#8b5cf6",
};

const FALLBACK_COLORS = ["#e03e3e", "#ea7a53", "#d97706", "#6366f1"];

function getCategoryColor(category: string, index: number): string {
  return CATEGORY_COLORS[category] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
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
  const { subscriptions } = useSubscriptionStore();
  const [period, setPeriod] = useState<Period>("monthly");

  const monthlyTotal = useMemo(() => {
    return subscriptions.reduce((sum, sub) => {
      const monthly =
        sub.billing === "Yearly" ? sub.price / 12 : sub.price;
      return sum + monthly;
    }, 0);
  }, [subscriptions]);

  const yearlyTotal = useMemo(() => {
    return subscriptions.reduce((sum, sub) => {
      const annual =
        sub.billing === "Yearly" ? sub.price : sub.price * 12;
      return sum + annual;
    }, 0);
  }, [subscriptions]);

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
      map.set(sub.category ?? "Other", (map.get(sub.category ?? "Other") ?? 0) + monthly);
    }
    const max = Math.max(...map.values(), 1);
    return Array.from(map.entries())
      .map(([category, total], i) => ({
        category,
        total,
        yearlyTotal: total * 12,
        percentage: Math.round((total / monthlyTotal) * 100),
        barWidth: total / max,
        color: getCategoryColor(category, i),
      }))
      .sort((a, b) => b.total - a.total);
  }, [subscriptions, monthlyTotal]);

  const topSubscriptions = useMemo(() => {
    const max = Math.max(...subscriptions.map((s) => s.price), 1);
    return [...subscriptions]
      .sort((a, b) => {
        const aMonthly = a.billing === "Yearly" ? a.price / 12 : a.price;
        const bMonthly = b.billing === "Yearly" ? b.price / 12 : b.price;
        return bMonthly - aMonthly;
      })
      .map((sub) => {
        const monthlyCost = sub.billing === "Yearly" ? sub.price / 12 : sub.price;
        return {
          ...sub,
          monthlyCost,
          yearlyCost: sub.billing === "Yearly" ? sub.price : sub.price * 12,
          barWidth: monthlyCost / max,
        };
      });
  }, [subscriptions]);

  const billingBreakdown = useMemo(() => {
    let monthlyCount = 0;
    let yearlyCount = 0;
    let monthlyCost = 0;
    let yearlyCost = 0;
    for (const sub of subscriptions) {
      if (sub.billing === "Yearly") {
        yearlyCount++;
        yearlyCost += sub.price;
      } else {
        monthlyCount++;
        monthlyCost += sub.price;
      }
    }
    return {
      monthly: { count: monthlyCount, total: monthlyCost },
      yearly: { count: yearlyCount, total: yearlyCost, monthlyEquiv: yearlyCost / 12 },
    };
  }, [subscriptions]);

  const smartInsight = useMemo(() => {
    if (categoryBreakdown.length === 0) return null;
    const topCat = categoryBreakdown[0];
    if (topSubscriptions.length === 0) return null;
    const topSub = topSubscriptions[0];
    const topSubPct = Math.round((topSub.monthlyCost / monthlyTotal) * 100);

    if (topCat.percentage >= 60) {
      return `${topCat.category} tools account for ${topCat.percentage}% of your monthly spend — that's ${formatCurrency(topCat.total)}/mo.`;
    }
    if (topSubPct >= 50) {
      return `${topSub.name} is your biggest expense at ${formatCurrency(topSub.monthlyCost)}/mo — ${topSubPct}% of your total.`;
    }
    return `You're spreading your ${formatCurrency(monthlyTotal)}/mo across ${categoryBreakdown.length} categories. The biggest is ${topCat.category}.`;
  }, [categoryBreakdown, topSubscriptions, monthlyTotal]);

  const handlePeriodChange = useCallback((p: Period) => setPeriod(p), []);

  if (subscriptions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background p-5">
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
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pt-5 pb-30"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-3xl font-sans-bold text-primary">Insights</Text>

          <View className="flex-row rounded-full bg-white p-0.5">
            <Pressable
              onPress={() => handlePeriodChange("monthly")}
              className={clsx(
                "rounded-full px-4 py-2",
                period === "monthly" ? "bg-primary" : "bg-transparent",
              )}
            >
              <Text
                className={clsx(
                  "text-sm font-sans-semibold",
                  period === "monthly" ? "text-white" : "text-muted-foreground",
                )}
              >
                Monthly
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handlePeriodChange("yearly")}
              className={clsx(
                "rounded-full px-4 py-2",
                period === "yearly" ? "bg-primary" : "bg-transparent",
              )}
            >
              <Text
                className={clsx(
                  "text-sm font-sans-semibold",
                  period === "yearly" ? "text-white" : "text-muted-foreground",
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
          <Text className="mt-2 text-5xl font-sans-extrabold text-primary tracking-tight">
            {formatCurrency(animatedTotal)}
          </Text>
          <View className="mt-3 flex-row items-center gap-2">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              {activeSubCount} subs
            </Text>
            <Text className="text-sm font-sans-medium text-muted-foreground">
              ·
            </Text>
            <Text className="text-sm font-sans-medium text-muted-foreground">
              {formatCurrency(avgPerSub)} avg
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View className="mb-8 flex-row gap-3">
          <View className="flex-1 items-center rounded-2xl bg-white p-4">
            <Text className="text-xs font-sans-medium text-muted-foreground">
              Yearly
            </Text>
            <Text className="mt-1 text-lg font-sans-bold text-primary">
              {formatCurrency(yearlyTotal)}
            </Text>
          </View>
          <View className="flex-1 items-center rounded-2xl bg-white p-4">
            <Text className="text-xs font-sans-medium text-muted-foreground">
              Active
            </Text>
            <Text className="mt-1 text-lg font-sans-bold text-primary">
              {activeSubCount}
            </Text>
          </View>
          <View className="flex-1 items-center rounded-2xl bg-white p-4">
            <Text className="text-xs font-sans-medium text-muted-foreground">
              Top Category
            </Text>
            <Text className="mt-1 text-lg font-sans-bold text-primary" numberOfLines={1}>
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
            const displayCost = period === "monthly" ? cat.total : cat.yearlyTotal;
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
                      {formatCurrency(displayCost)}
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
              period === "monthly" ? sub.monthlyCost : sub.yearlyCost;
            return (
              <View key={sub.id}>
                <View className="mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Text className="w-6 text-base font-sans-bold text-muted-foreground text-center">
                      #{i + 1}
                    </Text>
                    <Image source={sub.icon} className="size-8 rounded-md" />
                    <Text className="text-base font-sans-semibold text-primary">
                      {sub.name}
                    </Text>
                  </View>
                  <Text className="text-base font-sans-bold text-primary">
                    {formatCurrency(displayCost)}
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
          <View className="flex-1 rounded-2xl bg-white p-4">
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
              {formatCurrency(billingBreakdown.monthly.total)}
              <Text className="text-xs font-sans-medium text-muted-foreground">
                /mo
              </Text>
            </Text>
          </View>
          <View className="flex-1 rounded-2xl bg-white p-4">
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
              {formatCurrency(billingBreakdown.yearly.total)}
              <Text className="text-xs font-sans-medium text-muted-foreground">
                /yr
              </Text>
            </Text>
            <Text className="mt-1 text-xs font-sans-medium text-muted-foreground">
              ({formatCurrency(billingBreakdown.yearly.monthlyEquiv)}/mo equiv)
            </Text>
          </View>
        </View>

        {/* Smart Insight */}
        {smartInsight && (
          <View className="mb-6 flex-row gap-3 rounded-2xl bg-white p-5">
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
