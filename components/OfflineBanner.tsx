import { createContext, useContext, useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useThemeSync";

const BANNER_HEIGHT = 52;

type NetworkContextValue = {
  isOffline: boolean;
  bannerVisible: boolean;
};

const NetworkContext = createContext<NetworkContextValue>({
  isOffline: false,
  bannerVisible: false,
});

export const useNetwork = () => useContext(NetworkContext);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  return (
    <NetworkContext.Provider value={{ isOffline, bannerVisible }}>
      {children}
      <OfflineBannerController
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        setBannerVisible={setBannerVisible}
      />
    </NetworkContext.Provider>
  );
}

function OfflineBannerController({
  isOffline,
  setIsOffline,
  setBannerVisible,
}: {
  isOffline: boolean;
  setIsOffline: (v: boolean) => void;
  setBannerVisible: (v: boolean) => void;
}) {
  const wasOffline = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable);
      setIsOffline(offline);

      if (offline) {
        wasOffline.current = true;
        setBannerVisible(true);
      } else if (wasOffline.current) {
        setBannerVisible(true);
        setTimeout(() => {
          setBannerVisible(false);
          wasOffline.current = false;
        }, 3000);
      }
    });
    return () => unsubscribe();
  }, [setIsOffline, setBannerVisible]);

  return null;
}

export function OfflineBanner() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isOffline, bannerVisible } = useNetwork();
  const translateY = useRef(new Animated.Value(-BANNER_HEIGHT - insets.top)).current;

  useEffect(() => {
    if (bannerVisible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -BANNER_HEIGHT - insets.top,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [bannerVisible, translateY, insets.top]);

  if (!bannerVisible && translateY.__getValue() <= -BANNER_HEIGHT - insets.top) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.banner,
        {
          top: 0,
          paddingTop: insets.top,
          height: BANNER_HEIGHT + insets.top,
          backgroundColor: isOffline
            ? isDark ? "#27272a" : "#e8e8e6"
            : isDark ? "#064e3b" : "#d1fae5",
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={isOffline ? "cloud-offline-outline" : "checkmark-circle-outline"}
          size={16}
          color={
            isOffline
              ? isDark ? "rgba(237, 237, 237, 0.7)" : "rgba(55, 53, 47, 0.7)"
              : "#10b981"
          }
        />
        <Text
          style={[
            styles.text,
            {
              color: isOffline
                ? isDark ? "rgba(237, 237, 237, 0.7)" : "rgba(55, 53, 47, 0.7)"
                : "#059669",
            },
          ]}
        >
          {isOffline ? "You\u2019re offline" : "Back online"}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    fontSize: 13,
    fontFamily: "sans-medium",
  },
});
