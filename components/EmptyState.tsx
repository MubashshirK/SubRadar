import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/lib/useThemeSync";

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
};

const EmptyState = ({
  icon,
  title,
  description,
  ctaLabel,
  onCtaPress,
}: EmptyStateProps) => {
  const { isDark } = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="size-16 items-center justify-center rounded-full bg-muted mb-4">
        <Ionicons
          name={icon}
          size={28}
          color={isDark ? "rgba(237, 237, 237, 0.35)" : "rgba(55, 53, 47, 0.3)"}
        />
      </View>
      <Text className="text-base font-sans-semibold text-primary text-center">
        {title}
      </Text>
      {description ? (
        <Text className="mt-1.5 text-sm font-sans-medium text-muted-foreground text-center leading-5">
          {description}
        </Text>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <Pressable
          onPress={onCtaPress}
          className="mt-5 flex-row items-center gap-2 rounded-full bg-primary px-5 py-3 dark:bg-foreground"
        >
          <Ionicons name="add" size={16} color={isDark ? "#0f0f12" : "#fff"} />
          <Text className="text-cta text-white dark:text-background">
            {ctaLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default EmptyState;
