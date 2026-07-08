import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useThemeSync";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { isDark } = useTheme();

  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <View className="size-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <Ionicons name="warning-outline" size={28} color="#e03e3e" />
      </View>
      <Text className="text-lg font-sans-bold text-primary text-center">
        Something went wrong
      </Text>
      <Text className="mt-2 text-sm font-sans-medium text-muted-foreground text-center leading-5">
        An unexpected error occurred. Please try again.
      </Text>
      <Pressable
        onPress={onRetry}
        className="mt-6 flex-row items-center gap-2 rounded-full bg-primary px-6 py-3 dark:bg-foreground"
      >
        <Ionicons name="refresh" size={16} color={isDark ? "#0f0f12" : "#fff"} />
        <Text className="text-cta text-white dark:text-background">
          Try Again
        </Text>
      </Pressable>
    </View>
  );
}
