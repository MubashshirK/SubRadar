import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "@/lib/useThemeSync";

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export default function Sheet({
  visible,
  onClose,
  title,
  children,
}: SheetProps) {
  const { isDark } = useTheme();
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
          className="max-h-[85%] rounded-t-3xl bg-white dark:bg-card pb-8"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 24,
          }}
        >
          {/* Drag handle */}
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-muted" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-border px-6 py-4">
            <Text className="text-[17px] font-sans-bold text-primary">
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              className="size-8 items-center justify-center rounded-full bg-muted"
            >
              <Ionicons name="close" size={16} color={isDark ? "#888" : "#666"} />
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <View className="px-6 pt-6">{children}</View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
