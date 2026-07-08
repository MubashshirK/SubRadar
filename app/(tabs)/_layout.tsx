import CustomTabBar from "@/components/CustomTabBar";
import { OfflineBanner, useNetwork } from "@/components/OfflineBanner";
import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";

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

  if (!isLoaded) return null;

  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <TabContent />
    </View>
  );
};

export default TabLayout;
