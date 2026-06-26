import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, View, Text, LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";

const ICON_SIZE = 22;
const LABEL_SIZE = 13;
const PILL_PAD_X = 20;
const PILL_PAD_TOP = 4;
const PILL_PAD_BOT = 4;
const BAR_HEIGHT = 62;
const BAR_RADIUS = 22;
const PILL_RADIUS = 18;
const BAR_MARGIN_H = 20;
const BAR_BOTTOM = 16;
const SPRING = { damping: 22, stiffness: 280, mass: 0.9 };
const HOME_OFFSET = -6;

const FLEX_ACTIVE = 1.8;
const FLEX_NORMAL = 1;
const FLEX_SQUEEZED = 0.72;

type TabBarProps = {
  state: { index: number; routes: { name: string; key: string }[] };
  navigation: { navigate: (name: string) => void };
  descriptors: Record<string, { options: { title?: string } }>;
};

const ICON_MAP: Record<string, string> = {
  index: "home-outline",
  subscriptions: "wallet-outline",
  insights: "stats-chart-outline",
  settings: "settings-outline",
};

type TabItem = {
  name: string;
  title: string;
  icon: string;
};

function TabButton({
  tab,
  tabIndex,
  isActive,
  isHomeActive,
  flexVal,
  onPress,
  onContentLayout,
  onTabLayout,
}: {
  tab: TabItem;
  tabIndex: number;
  isActive: boolean;
  isHomeActive: boolean;
  flexVal: SharedValue<number>;
  onPress: () => void;
  onContentLayout: (name: string, e: LayoutChangeEvent) => void;
  onTabLayout: (e: LayoutChangeEvent) => void;
}) {
  const animStyle = useAnimatedStyle(() => ({
    flex: flexVal.value,
  }));

  return (
    <Animated.View
      onLayout={onTabLayout}
      style={[
        {
          height: BAR_HEIGHT,
          alignItems: "center",
          justifyContent: "center",
        },
        animStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        style={({ pressed }) => ({
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View
          onLayout={(e) => onContentLayout(tab.name, e)}
          style={{ flexDirection: "row", alignItems: "center", gap: 7, transform: [{ translateX: tabIndex <= 1 && isHomeActive ? HOME_OFFSET : 0 }] }}
        >
          <Ionicons
            name={tab.icon as any}
            size={ICON_SIZE}
            color={isActive ? "#fff" : "#888"}
          />
          {isActive && (
            <Text
              style={{
                fontSize: LABEL_SIZE,
                fontWeight: "600",
                color: "#fff",
                letterSpacing: 0.2,
              }}
            >
              {tab.title}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function CustomTabBar({
  state,
  navigation,
  descriptors,
}: TabBarProps) {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(0);
  const pillW = useSharedValue(0);
  const measuresRef = useRef<Record<string, { x: number; w: number }>>({});
  const barWidthRef = useRef(0);
  const tabPositions = useRef<{ x: number; w: number }[]>([
    { x: 0, w: 0 },
    { x: 0, w: 0 },
    { x: 0, w: 0 },
    { x: 0, w: 0 },
  ]);

  const activeName = state.routes[state.index].name;
  const activeIndex = state.index;

  const flex0 = useSharedValue(1);
  const flex1 = useSharedValue(1);
  const flex2 = useSharedValue(1);
  const flex3 = useSharedValue(1);
  const flexVals = useMemo(() => [flex0, flex1, flex2, flex3], [flex0, flex1, flex2, flex3]);

  const tabs = useMemo(
    () =>
      state.routes.map((route) => {
        const opts = descriptors[route.key]?.options ?? {};
        return {
          name: route.name,
          title: opts.title ?? route.name,
          icon: ICON_MAP[route.name] ?? "ellipse-outline",
        };
      }),
    [state.routes, descriptors],
  );

  useEffect(() => {
    const isMiddle = activeIndex === 1 || activeIndex === 2;
    flex0.value = withSpring(
      activeIndex === 0 ? FLEX_ACTIVE : isMiddle ? FLEX_SQUEEZED : FLEX_NORMAL,
      SPRING,
    );
    flex1.value = withSpring(
      activeIndex === 1 ? FLEX_ACTIVE : FLEX_NORMAL,
      SPRING,
    );
    flex2.value = withSpring(
      activeIndex === 2 ? FLEX_ACTIVE : FLEX_NORMAL,
      SPRING,
    );
    flex3.value = withSpring(
      activeIndex === 3 ? FLEX_ACTIVE : isMiddle ? FLEX_SQUEEZED : FLEX_NORMAL,
      SPRING,
    );
  }, [activeIndex, flex0, flex1, flex2, flex3]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: pillW.value,
  }));

  const updatePill = useCallback(
    (name: string, idx: number) => {
      const m = measuresRef.current[name];
      const tabPos = tabPositions.current[idx];
      if (m && tabPos && tabPos.w > 0) {
        const pw = m.w + PILL_PAD_X * 2;
        const offset = idx === 0 ? HOME_OFFSET : 0;
        pillW.value = withSpring(pw, SPRING);
        translateX.value = withSpring(tabPos.x + (tabPos.w - pw) / 2 + offset, SPRING);
      }
    },
    [translateX, pillW],
  );

  useEffect(() => {
    updatePill(activeName, activeIndex);
  }, [activeName, activeIndex, updatePill]);

  const handleBarLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      barWidthRef.current = w;
      const m = measuresRef.current[activeName];
      const tabPos = tabPositions.current[activeIndex];
      if (m && tabPos && tabPos.w > 0) {
        const pw = m.w + PILL_PAD_X * 2;
        const offset = activeIndex === 0 ? HOME_OFFSET : 0;
        pillW.value = pw;
        translateX.value = tabPos.x + (tabPos.w - pw) / 2 + offset;
      }
    },
    [activeName, activeIndex, translateX, pillW],
  );

  const handleContentLayout = useCallback(
    (name: string, e: LayoutChangeEvent) => {
      const { width } = e.nativeEvent.layout;
      measuresRef.current[name] = { x: 0, w: width };
      if (barWidthRef.current > 0 && name === activeName) {
        const tabPos = tabPositions.current[activeIndex];
        if (tabPos && tabPos.w > 0) {
          const pw = width + PILL_PAD_X * 2;
          const offset = activeIndex === 0 ? HOME_OFFSET : 0;
          pillW.value = withSpring(pw, SPRING);
          translateX.value = withSpring(tabPos.x + (tabPos.w - pw) / 2 + offset, SPRING);
        }
      }
    },
    [activeName, activeIndex, translateX, pillW],
  );

  const handleTabLayout = useCallback(
    (i: number, e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      tabPositions.current[i] = { x, w: width };
      if (i === activeIndex) {
        const m = measuresRef.current[activeName];
        if (m) {
          const pw = m.w + PILL_PAD_X * 2;
          const offset = i === 0 ? HOME_OFFSET : 0;
          pillW.value = withSpring(pw, SPRING);
          translateX.value = withSpring(x + (width - pw) / 2 + offset, SPRING);
        }
      }
    },
    [activeIndex, activeName, translateX, pillW],
  );

  return (
    <View
      style={{
        position: "absolute",
        bottom: Math.max(insets.bottom, BAR_BOTTOM),
        left: BAR_MARGIN_H,
        right: BAR_MARGIN_H,
        height: BAR_HEIGHT,
        borderRadius: BAR_RADIUS,
        backgroundColor: "#fff",
        padding: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 10,
      }}
    >
      <View
        onLayout={handleBarLayout}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          borderRadius: BAR_RADIUS - 3,
          overflow: "hidden",
          backgroundColor: "rgba(230, 230, 230, 0.94)",
        }}
      >
      <Animated.View
        style={[
          pillStyle,
          {
            position: "absolute",
            left: 0,
            top: PILL_PAD_TOP,
            bottom: PILL_PAD_BOT,
            borderRadius: PILL_RADIUS,
            backgroundColor: "#191919",
          },
        ]}
      />

      {tabs.map((tab, i) => {
        const isActive = tab.name === activeName;
        return (
          <TabButton
            key={tab.name}
            tab={tab}
            tabIndex={i}
            isActive={isActive}
            isHomeActive={activeIndex === 0}
            flexVal={flexVals[i]}
            onPress={() => navigation.navigate(tab.name)}
            onContentLayout={handleContentLayout}
            onTabLayout={(e) => handleTabLayout(i, e)}
          />
        );
      })}
      </View>
    </View>
  );
}
