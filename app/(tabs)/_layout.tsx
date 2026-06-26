import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import CustomTabBar from "@/components/CustomTabBar";

const TabLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="subscriptions" options={{ title: "Subscriptions" }} />
      <Tabs.Screen name="insights" options={{ title: "Insights" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
};

export default TabLayout;
