import React, { useCallback } from "react";
import { Pressable, type PressableProps, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  type WithSpringConfig,
} from "react-native-reanimated";

const SPRING_CONFIG: WithSpringConfig = {
  damping: 25,
  stiffness: 300,
  mass: 0.5,
};

interface ScalePressProps extends Omit<PressableProps, "children" | "style"> {
  children: React.ReactNode;
  style?: ViewStyle | ((pressed: boolean) => ViewStyle);
  scale?: number;
  disabledOpacity?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ScalePress({
  children,
  onPress,
  onPressIn,
  onPressOut,
  scale = 0.96,
  disabled,
  disabledOpacity = true,
  ...rest
}: ScalePressProps) {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: disabled && disabledOpacity ? 0.5 : 1,
  }));

  const handlePressIn = useCallback(
    (event: any) => {
      scaleValue.value = withSpring(scale, SPRING_CONFIG);
      onPressIn?.(event);
    },
    [onPressIn, scaleValue, scale],
  );

  const handlePressOut = useCallback(
    (event: any) => {
      scaleValue.value = withSpring(1, SPRING_CONFIG);
      onPressOut?.(event);
    },
    [onPressOut, scaleValue],
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={({ pressed }: { pressed: boolean }) => [
        animatedStyle,
        // @ts-ignore -- reanimated animated component style handling
        typeof rest.style === "function"
          ? rest.style(pressed)
          : rest.style,
      ]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
