import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { shadowToast } from "@/constants/shadows";
import Animated, {
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

type ToastType = "success" | "error" | "info";

type ToastProps = {
  message: string;
  type?: ToastType;
  onDismiss: () => void;
};

const ICON_MAP: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  error: "alert-circle",
  info: "information-circle",
};

const ICON_COLOR: Record<ToastType, string> = {
  success: "#10b981",
  error: "#e03e3e",
  info: "#6366f1",
};

const ACCENT_COLOR: Record<ToastType, string> = {
  success: "#10b981",
  error: "#e03e3e",
  info: "#6366f1",
};

export default function Toast({ message, type = "success", onDismiss }: ToastProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 250 });
    translateY.value = withTiming(0, { duration: 250 });

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) runOnJS(onDismiss)();
      });
      translateY.value = withTiming(-20, { duration: 200 });
    }, 2500);

    return () => clearTimeout(timer);
  }, [onDismiss, opacity, translateY]);

  return (
    <Animated.View
      style={[{ opacity, transform: [{ translateY }] }, shadowToast]}
      className="absolute top-12 left-5 right-5 z-50 overflow-hidden rounded-2xl border border-white/20 dark:border-white/5"
    >
      <View className="flex-row items-center bg-muted">
        <View
          style={{ backgroundColor: ACCENT_COLOR[type] }}
          className="h-full w-1 self-stretch"
        />
        <View className="flex-1 flex-row items-center gap-3 px-4 py-4">
          <Ionicons name={ICON_MAP[type]} size={20} color={ICON_COLOR[type]} />
          <Text className="flex-1 text-[14px] font-sans-semibold text-primary">
            {message}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
