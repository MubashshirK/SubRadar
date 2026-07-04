import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { useSettingsStore } from "./settingsStore";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  resolvedScheme: ColorSchemeName;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  isDark: false,
  resolvedScheme: Appearance.getColorScheme(),
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const [resolvedScheme, setResolvedScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  const updateScheme = useCallback(() => {
    const resolved = themeMode === "system"
      ? Appearance.getColorScheme()
      : themeMode;
    setResolvedScheme(resolved);

    if (themeMode === "system") {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(themeMode);
    }
  }, [themeMode]);

  useEffect(() => {
    updateScheme();
  }, [updateScheme]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === "system") {
        setResolvedScheme(colorScheme);
      }
    });
    return () => subscription.remove();
  }, [themeMode]);

  const theme: Theme = resolvedScheme === "dark" ? "dark" : "light";
  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, isDark, resolvedScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeSync() {
  const themeMode = useSettingsStore((s) => s.themeMode);

  useEffect(() => {
    if (themeMode === "system") {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(themeMode);
    }
  }, [themeMode]);
}
