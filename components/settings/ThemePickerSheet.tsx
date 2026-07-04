import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeMode } from "@/lib/settingsStore";

type ThemePickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  selected: ThemeMode;
  onSelect: (mode: ThemeMode) => void;
};

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: "system", label: "System", icon: "phone-portrait-outline" },
  { mode: "light", label: "Light", icon: "sunny-outline" },
  { mode: "dark", label: "Dark", icon: "moon-outline" },
];

export default function ThemePickerSheet({
  visible,
  onClose,
  selected,
  onSelect,
}: ThemePickerSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        onPress={onClose}
      >
        <Pressable
          className="w-[300px] rounded-2xl bg-white dark:bg-[#1a1a1a] p-5"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 12,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <Text className="text-center text-base font-sans-bold text-primary mb-4">
            Appearance
          </Text>

          {/* Options */}
          <View className="gap-2">
            {THEME_OPTIONS.map((option) => {
              const isSelected = option.mode === selected;
              return (
                <Pressable
                  key={option.mode}
                  onPress={() => {
                    onSelect(option.mode);
                    onClose();
                  }}
                  className={`flex-row items-center gap-3 rounded-xl px-4 py-3.5 ${
                    isSelected ? "bg-accent/10" : "active:bg-muted"
                  }`}
                >
                  <View
                    className={`size-9 items-center justify-center rounded-lg ${
                      isSelected ? "bg-accent/15" : "bg-muted"
                    }`}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={18}
                      color={isSelected ? "#2f6fed" : "#999"}
                    />
                  </View>
                  <Text className="flex-1 text-[15px] font-sans-medium text-primary">
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#2f6fed"
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Cancel */}
          <Pressable
            onPress={onClose}
            className="mt-3 items-center rounded-xl border border-border py-3"
          >
            <Text className="text-sm font-sans-semibold text-muted-foreground">
              Cancel
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
