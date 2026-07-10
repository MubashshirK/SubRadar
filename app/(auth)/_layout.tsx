import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, Image, useColorScheme, View } from "react-native";
import appIconLight from "@/assets/app-icon.png";
import appIconDark from "@/assets/app-icon-dark.png";

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center gap-6 bg-background">
        <Image
          source={isDark ? appIconDark : appIconLight}
          resizeMode="contain"
          style={{ width: 80, height: 80 }}
        />
        <ActivityIndicator size="large" color={isDark ? "#ededed" : "#191919"} />
      </View>
    );
  }

  if (isSignedIn) return <Redirect href="/(tabs)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
