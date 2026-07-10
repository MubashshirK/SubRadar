import React from "react";
import { View } from "react-native";
import { Skeleton, SkeletonCircle, SkeletonText } from "./Skeleton";

export default function HomeSkeleton() {
  return (
    <View className="flex-1 bg-background p-5">
      {/* Header: avatar + name + add button */}
      <View className="mb-2.5 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <SkeletonCircle size={64} />
          <View className="ml-4 gap-2">
            <SkeletonText width={120} height={20} />
          </View>
        </View>
        <SkeletonCircle size={40} />
      </View>

      {/* Balance card skeleton */}
      <View
        className="my-2.5 justify-between gap-4 rounded-3xl bg-muted p-6"
        style={{ minHeight: 200 }}
      >
        <SkeletonText width={100} height={16} />
        <View className="flex-row items-end justify-between gap-3">
          <SkeletonText width={160} height={36} />
          <View className="items-end gap-1.5">
            <SkeletonText width={60} height={18} />
            <SkeletonText width={80} height={12} />
          </View>
        </View>
        <View className="flex-row items-center gap-5">
          <View className="items-center gap-1.5">
            <SkeletonText width={30} height={16} />
            <SkeletonText width={40} height={12} />
          </View>
          <View className="items-center gap-1.5">
            <SkeletonText width={50} height={16} />
            <SkeletonText width={50} height={12} />
          </View>
          <View className="items-center gap-1.5">
            <SkeletonText width={60} height={16} />
            <SkeletonText width={40} height={12} />
          </View>
        </View>
      </View>

      {/* Upcoming section */}
      <View className="my-4 flex-row items-center justify-between">
        <SkeletonText width={110} height={24} />
        <SkeletonText width={140} height={14} />
      </View>
      <View className="mb-4 flex-row gap-3">
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            className="w-44 rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-card p-3.5"
          >
            <View className="flex-row items-start justify-between">
              <SkeletonCircle size={40} />
              <SkeletonText width={50} height={14} />
            </View>
            <View className="mt-3 gap-1.5">
              <SkeletonText width="80%" height={16} />
              <SkeletonText width="50%" height={12} />
            </View>
          </View>
        ))}
      </View>

      {/* All Subscriptions heading */}
      <View className="my-4 flex-row items-center justify-between">
        <SkeletonText width={160} height={24} />
      </View>

      {/* Subscription cards */}
      {[1, 2, 3].map((i) => (
        <View key={i} className="mb-4 rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-card p-4">
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
  );
}
