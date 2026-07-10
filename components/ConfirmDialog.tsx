import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shadowDialog } from "@/constants/shadows";

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
}

export default function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-[300px] items-center rounded-2xl bg-white p-6 dark:bg-card"
          style={shadowDialog}
        >
          {/* Icon */}
          <View className="mb-4 size-12 items-center justify-center rounded-full bg-destructive/10">
            <Ionicons
              name={destructive ? "trash-outline" : "log-out-outline"}
              size={24}
              color="#e03e3e"
            />
          </View>

          {/* Title */}
          <Text className="mb-2 text-center text-[17px] font-sans-bold text-primary">
            {title}
          </Text>

          {/* Message */}
          <Text className="mb-6 text-center text-[14px] font-sans-medium leading-5 text-muted-foreground">
            {message}
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={onClose}
              disabled={loading}
              className="flex-1 items-center justify-center rounded-xl border border-border py-3"
            >
              <Text className="text-[14px] font-sans-semibold text-primary">
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-destructive py-3"
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-[14px] font-sans-semibold text-white">
                  {confirmLabel}
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
