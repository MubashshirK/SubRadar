import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton, SkeletonCircle, SkeletonText } from "./Skeleton";

function StatCardSkeleton() {
  return (
    <View className="flex-1 items-center rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-card p-4">
      <SkeletonText width={50} height={12} />
      <SkeletonText width={60} height={20} className="mt-2" />
    </View>
  );
}

function CategoryRowSkeleton() {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <SkeletonCircle size={10} />
          <SkeletonText width={90} height={16} />
        </View>
        <View className="flex-row items-center gap-3">
          <SkeletonText width={30} height={14} />
          <SkeletonText width={60} height={16} />
        </View>
      </View>
      <Skeleton height={8} borderRadius={4} />
    </View>
  );
}

function TopSubRowSkeleton() {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <SkeletonText width={20} height={16} />
          <SkeletonCircle size={32} borderRadius={8} />
          <SkeletonText width={80} height={16} />
        </View>
        <SkeletonText width={70} height={16} />
      </View>
      <Skeleton height={6} borderRadius={3} />
    </View>
  );
}

function BillingCardSkeleton() {
  return (
    <View className="flex-1 rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-card p-4">
      <View className="mb-3 flex-row items-center gap-2">
        <SkeletonCircle size={16} />
        <SkeletonText width={50} height={12} />
      </View>
      <SkeletonText width={40} height={24} />
      <SkeletonText width={70} height={12} className="mt-1" />
      <SkeletonText width={80} height={18} className="mt-3" />
    </View>
  );
}

export default function InsightsSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-background pb-5">
      <View className="px-5 pt-5">
        {/* Header */}
        <View className="mb-2 flex-row items-center justify-between">
          <SkeletonText width={130} height={30} />
          <View className="flex-row rounded-full bg-white dark:bg-card p-0.5">
            <Skeleton width={90} height={36} borderRadius={18} />
            <Skeleton width={90} height={36} borderRadius={18} className="ml-1" />
          </View>
        </View>

        {/* Hero metric */}
        <View className="mt-6 items-center pb-8">
          <SkeletonText width={120} height={14} />
          <SkeletonText width={180} height={42} className="mt-3" />
          <View className="mt-3 flex-row items-center gap-2">
            <SkeletonText width={50} height={14} />
            <SkeletonText width={10} height={14} />
            <SkeletonText width={60} height={14} />
          </View>
        </View>

        {/* Stats row */}
        <View className="mb-8 flex-row gap-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </View>

        {/* Category Breakdown */}
        <SkeletonText width={130} height={12} className="mb-4" />
        <View className="mb-8 gap-4">
          <CategoryRowSkeleton />
          <CategoryRowSkeleton />
          <CategoryRowSkeleton />
        </View>

        {/* Top Subscriptions */}
        <SkeletonText width={120} height={12} className="mb-4" />
        <View className="mb-8 gap-4">
          <TopSubRowSkeleton />
          <TopSubRowSkeleton />
          <TopSubRowSkeleton />
        </View>

        {/* Billing Overview */}
        <SkeletonText width={110} height={12} className="mb-4" />
        <View className="mb-8 flex-row gap-3">
          <BillingCardSkeleton />
          <BillingCardSkeleton />
        </View>

        {/* Smart Insight */}
        <View className="mb-6 flex-row gap-3 rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-card p-5">
          <View className="mt-0.5 h-5 w-1 rounded-full bg-muted" />
          <View className="flex-1 gap-2">
            <SkeletonText width={60} height={12} />
            <SkeletonText width="90%" height={14} />
            <SkeletonText width="70%" height={14} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
