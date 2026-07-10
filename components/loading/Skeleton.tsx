import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { DimensionValue, View } from "react-native";
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/lib/useThemeSync";

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 8,
  className,
}: SkeletonProps) {
  const { isDark } = useTheme();
  const shimmerX = useSharedValue(-200);

  useEffect(() => {
    shimmerX.value = withRepeat(
      withTiming(200, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [shimmerX]);

  const shimmerColors: [string, string, string] = isDark
    ? ["rgba(255,255,255,0)", "rgba(255,255,255,0.06)", "rgba(255,255,255,0)"]
    : ["rgba(0,0,0,0)", "rgba(0,0,0,0.04)", "rgba(0,0,0,0)"];

  return (
    <View
      className={`overflow-hidden bg-muted ${className ?? ""}`}
      style={{ width, height, borderRadius }}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateX: shimmerX }],
        }}
      >
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: "200%", height: "100%" }}
        />
      </Animated.View>
    </View>
  );
}

export function SkeletonCircle({
  size = 40,
  borderRadius,
  className,
}: {
  size?: number;
  borderRadius?: number;
  className?: string;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={borderRadius ?? size / 2}
      className={className}
    />
  );
}

export function SkeletonText({
  width = "100%",
  height = 14,
  className,
}: {
  width?: DimensionValue;
  height?: number;
  className?: string;
}) {
  return <Skeleton width={width} height={height} borderRadius={6} className={className} />;
}
