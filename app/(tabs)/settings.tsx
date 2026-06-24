import { useClerk, useUser } from "@clerk/expo";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="auth-brand-block mb-8">
        <View className="auth-logo-wrap">
          <View className="auth-logo-mark">
            <Text className="auth-logo-mark-text">S</Text>
          </View>
          <View>
            <Text className="auth-wordmark">SubRadar</Text>
            <Text className="auth-wordmark-sub">Track. Manage. Save.</Text>
          </View>
        </View>
      </View>

      <View className="auth-card">
        <Text className="auth-title mb-2">Account</Text>
        {user?.primaryEmailAddress && (
          <Text className="auth-helper">
            Signed in as{" "}
            <Text className="font-sans-bold text-primary">
              {user.primaryEmailAddress.emailAddress}
            </Text>
          </Text>
        )}
      </View>

      <Pressable
        className={`auth-button mt-6 ${isSigningOut ? "auth-button-disabled" : ""}`}
        onPress={handleSignOut}
        disabled={isSigningOut}
      >
        <Text className="auth-button-text">
          {isSigningOut ? "Signing out…" : "Sign out"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Settings;
