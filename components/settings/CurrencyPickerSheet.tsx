import { getExchangeRates } from "@/lib/currency";
import {
  CURRENCIES,
  type CurrencyCode,
  type CurrencyEntry,
} from "@/lib/settingsStore";
import { useTheme } from "@/lib/useThemeSync";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SectionList,
  Text,
  TextInput,
  View,
} from "react-native";

type CurrencyPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  selected: CurrencyCode;
  onSelect: (code: CurrencyCode) => void;
};

type Section = {
  title: string;
  data: CurrencyEntry[];
};

export default function CurrencyPickerSheet({
  visible,
  onClose,
  selected,
  onSelect,
}: CurrencyPickerSheetProps) {
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");
  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    if (visible) {
      setQuery("");
      getExchangeRates().then(setRates);
    }
  }, [visible]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const items = q
      ? CURRENCIES.filter(
          (c) =>
            c.code.toLowerCase().includes(q) ||
            c.label.toLowerCase().includes(q) ||
            c.symbol.includes(q),
        )
      : [...CURRENCIES];

    const map = new Map<string, CurrencyEntry[]>();
    for (const c of items) {
      const list = map.get(c.region) ?? [];
      list.push(c);
      map.set(c.region, list);
    }

    const regionOrder = ["Americas", "Europe", "Asia Pacific", "Middle East"];
    const sections: Section[] = [];
    for (const region of regionOrder) {
      const data = map.get(region);
      if (data?.length) sections.push({ title: region, data });
    }
    return sections;
  }, [query]);

  const formatRate = (code: string) => {
    const rate = rates[code];
    if (!rate || rate === 1) return null;
    return `1 USD ≈ ${Math.round(rate * 100) / 100} ${code}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Overlay */}
        <Pressable className="flex-1 bg-black/50" onPress={onClose} />

        {/* Sheet */}
        <View
          className="max-h-[85%] rounded-t-3xl bg-white dark:bg-[#1a1a1a] pb-8"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 24,
            overflow: "hidden",
          }}
        >
          {/* Drag handle */}
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-muted" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-border px-6 py-4">
            <Text className="text-[17px] font-sans-bold text-primary">
              Default currency
            </Text>
            <Pressable
              onPress={onClose}
              className="size-8 items-center justify-center rounded-full bg-muted"
            >
              <Ionicons
                name="close"
                size={16}
                color={isDark ? "#888" : "#666"}
              />
            </Pressable>
          </View>

          {/* List */}
          <SectionList
            sections={filtered}
            keyExtractor={(item) => item.code}
            stickySectionHeadersEnabled={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <View className="mx-6 mt-4 flex-row items-center gap-2 rounded-xl border border-input bg-muted px-3.5 py-2.5">
                <Ionicons
                  name="search-outline"
                  size={16}
                  color={
                    isDark
                      ? "rgba(237, 237, 237, 0.4)"
                      : "rgba(55, 53, 47, 0.4)"
                  }
                />
                <TextInput
                  className="min-w-0 flex-1 text-[15px] font-sans-medium text-primary"
                  placeholderTextColor={
                    isDark
                      ? "rgba(237, 237, 237, 0.35)"
                      : "rgba(55, 53, 47, 0.35)"
                  }
                  placeholder="Search currencies…"
                  value={query}
                  onChangeText={setQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
                {query.length > 0 && (
                  <Pressable onPress={() => setQuery("")}>
                    <Ionicons
                      name="close-circle"
                      size={16}
                      color={
                        isDark
                          ? "rgba(237, 237, 237, 0.3)"
                          : "rgba(55, 53, 47, 0.3)"
                      }
                    />
                  </Pressable>
                )}
              </View>
            }
            ListEmptyComponent={
              <View className="items-center py-8">
                <Text className="text-[14px] font-sans-medium text-muted-foreground">
                  No currencies match &quot;{query}&quot;
                </Text>
              </View>
            }
            renderSectionHeader={({ section }) => (
              <Text className="mb-1 mt-4 px-6 text-[11px] font-sans-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </Text>
            )}
            renderItem={({ item: c }) => {
              const isSelected = c.code === selected;
              const rateHint = formatRate(c.code);

              return (
                <Pressable
                  onPress={() => {
                    onSelect(c.code);
                    onClose();
                  }}
                  className={`mx-6 flex-row items-center gap-3 rounded-xl px-3.5 py-3 ${
                    isSelected ? "bg-accent/10" : "active:bg-muted"
                  }`}
                >
                  {/* Flag */}
                  <View
                    className={`size-9 items-center justify-center rounded-lg ${
                      isSelected
                        ? "bg-accent/15"
                        : isDark
                          ? "bg-[#333333]"
                          : "bg-[#f0f0f0]"
                    }`}
                  >
                    <Text className="text-xl">{c.flag}</Text>
                  </View>

                  {/* Label + rate hint */}
                  <View className="min-w-0 flex-1">
                    <Text className="text-[15px] font-sans-medium text-primary">
                      {c.label}
                    </Text>
                    {rateHint && (
                      <Text className="text-[12px] font-sans text-muted-foreground">
                        {rateHint}
                      </Text>
                    )}
                  </View>

                  {/* Code badge + checkmark */}
                  <View className="flex-row shrink-0 items-center gap-1.5">
                    <Text className="text-[13px] font-sans-semibold text-muted-foreground">
                      {c.code}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#06960d"
                        style={{
                          marginLeft: 2,
                          paddingTop: 4,
                        }}
                      />
                    )}
                  </View>
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View className="h-0.5" />}
            contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 16 }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
