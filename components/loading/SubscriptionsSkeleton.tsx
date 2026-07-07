import React from "react";
import { View } from "react-native";
import { Skeleton, SkeletonCircle, SkeletonText } from "./Skeleton";

export default function SubscriptionsSkeleton() {
  return (
    <View className="flex-1 bg-background pb-5">
      <View className="px-5 pt-5">
        {/* Header */}
        <View className="mb-1 flex-row items-center justify-between">
          <SkeletonText width={200} height={30} />
          <SkeletonCircle size={40} />
        </View>

        {/* Summary */}
        <SkeletonText width={180} height={14} className="mb-5 mt-2" />

        {/* Search bar */}
        <View className="mb-4 flex-row items-center rounded-xl bg-muted px-4 py-3">
          <SkeletonCircle size={18} />
          <SkeletonText width="60%" height={16} className="ml-2.5" />
        </View>

        {/* Category filters */}
        <View className="mb-5 flex-row gap-2">
          {[80, 60, 90, 70, 85].map((w, i) => (
            <Skeleton key={i} width={w} height={36} borderRadius={18} />
          ))}
        </View>
      </View>

      {/* Subscription cards */}
      <View className="px-5">
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className="mb-3 rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-card p-4">
            <View className="flex-row items-center py-2 pl-1 pr-2">
              <SkeletonCircle size={52} borderRadius={14} />
              <View className="ml-3 flex-1 gap-2">
                <SkeletonText width="60%" height={16} />
                <SkeletonText width="40%" height={12} />
              </View>
              <View className="items-end gap-1.5">
                <SkeletonText width={60} height={14} />
                <Skeleton width={50} height={20} borderRadius={10} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
