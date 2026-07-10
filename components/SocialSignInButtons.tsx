import { useOAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { ActivityIndicator, Alert, Image, Modal, Pressable, Text, useColorScheme, View } from "react-native";
import { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import appIconLight from "@/assets/app-icon.png";
import appIconDark from "@/assets/app-icon-dark.png";

type Provider = "google" | "apple" | "microsoft";

const PROVIDER_INFO: Record<
  Provider,
  { label: string; iconName: string }
> = {
  google: { label: "Continue with Google", iconName: "google" },
  apple: { label: "Continue with Apple", iconName: "apple" },
  microsoft: { label: "Continue with Microsoft", iconName: "windows" },
};

function OAuthButton({
  provider,
  loading,
  onPress,
}: {
  provider: Provider;
  loading: Provider | null;
  onPress: () => void;
}) {
  const info = PROVIDER_INFO[provider];
  const isBusy = loading === provider;

  return (
    <Pressable
      className={`flex-row items-center justify-center gap-2.5 rounded-full border border-input py-3.5 ${isBusy ? "opacity-40" : ""}`}
      onPress={onPress}
      disabled={isBusy}
    >
      <FontAwesome name={info.iconName as any} size={16} color="#999" />
      <Text className="text-[14px] font-sans-semibold text-primary">
        {isBusy ? "Connecting\u2026" : info.label}
      </Text>
    </Pressable>
  );
}

function useOAuthFlow(strategy: "oauth_google" | "oauth_apple" | "oauth_microsoft") {
  const { startOAuthFlow } = useOAuth({ strategy });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/"),
      });

      if (createdSessionId && setActive) {
        setModalVisible(true);
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      if (
        err.code === "ERR_REQUEST_CANCELED" ||
        err.code === "OAUTH_CANCELED" ||
        err.message?.includes("canceled")
      ) {
        setLoading(false);
        return;
      }

      Alert.alert("Error", err.message || "Something went wrong");
      console.error(`${strategy} error:`, JSON.stringify(err, null, 2));
      setLoading(false);
    }
  };

  return { loading, modalVisible, handlePress };
}

export function SocialSignInButtons() {
  const google = useOAuthFlow("oauth_google");
  const apple = useOAuthFlow("oauth_apple");
  const microsoft = useOAuthFlow("oauth_microsoft");
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const loading = google.loading ? "google" : apple.loading ? "apple" : microsoft.loading ? "microsoft" : null;
  const showModal = google.modalVisible || apple.modalVisible || microsoft.modalVisible;

  return (
    <>
      <View className="mt-5 gap-2.5">
        <View className="flex-row items-center gap-3">
          <View className="h-[1px] flex-1 bg-border" />
          <Text className="text-[11px] font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
            Or
          </Text>
          <View className="h-[1px] flex-1 bg-border" />
        </View>

        <OAuthButton provider="google" loading={loading} onPress={google.handlePress} />
        <OAuthButton provider="apple" loading={loading} onPress={apple.handlePress} />
        <OAuthButton provider="microsoft" loading={loading} onPress={microsoft.handlePress} />
      </View>

      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center gap-6 bg-background">
          <Image
            source={isDark ? appIconDark : appIconLight}
            resizeMode="contain"
            style={{ width: 80, height: 80 }}
          />
          <ActivityIndicator size="large" color={isDark ? "#ededed" : "#191919"} />
        </View>
      </Modal>
    </>
  );
}
