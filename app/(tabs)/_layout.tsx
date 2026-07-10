import CustomTabBar from "@/components/CustomTabBar";
import { OfflineBanner, useNetwork } from "@/components/OfflineBanner";
import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, Image, useColorScheme, View } from "react-native";
import appIconLight from "@/assets/app-icon.png";
import appIconDark from "@/assets/app-icon-dark.png";

const BANNER_HEIGHT = 52;

function TabContent() {
  const { bannerVisible } = useNetwork();

  return (
    <View style={{ flex: 1, paddingTop: bannerVisible ? BANNER_HEIGHT : 0 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="subscriptions" options={{ title: "All Subs" }} />
        <Tabs.Screen name="insights" options={{ title: "Insights" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      </Tabs>
    </View>
  );
}

const TabLayout = () => {
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

  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <TabContent />
    </View>
  );
};

export default TabLayout;
