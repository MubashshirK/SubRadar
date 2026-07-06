import { useEffect, useState, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online =
        state.isConnected === true &&
        (state.isInternetReachable === true ||
          state.isInternetReachable === null);
      setIsOnline(online);
    });

    return () => unsubscribe();
  }, []);

  const isCurrentlyOnline = useCallback(async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return (
      state.isConnected === true &&
      (state.isInternetReachable === true || state.isInternetReachable === null)
    );
  }, []);

  return { isOnline, isCurrentlyOnline };
}
