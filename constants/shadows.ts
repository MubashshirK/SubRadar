import { Platform, ViewStyle } from "react-native";

type ShadowStyle = Required<Pick<ViewStyle, "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation">>;

const SHADOW_COLOR = "#000";

function createShadow(
  offset: { width: number; height: number },
  opacity: number,
  radius: number,
  elevation: number,
): ShadowStyle {
  return {
    shadowColor: SHADOW_COLOR,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Platform.OS === "android" ? elevation : 0,
  };
}

/** Subtle card shadow — used for subscription cards, stat cards, list items */
export const shadowCard: ShadowStyle = createShadow(
  { width: 0, height: 1 },
  0.05,
  2,
  1,
);

/** Medium floating element — autocomplete dropdowns */
export const shadowDropdown: ShadowStyle = createShadow(
  { width: 0, height: 4 },
  0.1,
  12,
  8,
);

/** Heavy overlay — dialogs, date pickers, centered popups */
export const shadowDialog: ShadowStyle = createShadow(
  { width: 0, height: 8 },
  0.15,
  24,
  12,
);

/** Bottom sheet — slides up from bottom (upward shadow) */
export const shadowSheet: ShadowStyle = createShadow(
  { width: 0, height: -4 },
  0.15,
  24,
  20,
);

/** Tab bar — floating bottom navigation */
export const shadowTabBar: ShadowStyle = createShadow(
  { width: 0, height: 6 },
  0.08,
  20,
  10,
);

/** Toast notification — floating at top */
export const shadowToast: ShadowStyle = createShadow(
  { width: 0, height: 8 },
  0.18,
  20,
  10,
);

/** Input/dropdown shadow — lighter than dropdown */
export const shadowInput: ShadowStyle = createShadow(
  { width: 0, height: 2 },
  0.08,
  8,
  4,
);
