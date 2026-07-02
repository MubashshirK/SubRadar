import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Sheet from "./Sheet";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ChangePasswordSheet({ visible, onClose }: Props) {
  const { user } = useUser();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setSuccess(false);
    }
  }, [visible]);

  const validate = (): string | null => {
    if (!currentPassword) return "Current password is required";
    if (!newPassword) return "New password is required";
    if (newPassword.length < 8) return "Must be at least 8 characters";
    if (newPassword === currentPassword)
      return "New password must be different";
    if (newPassword !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleUpdate = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await user?.updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: false,
      });
      setSuccess(true);
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.message ||
        err?.message ||
        "Failed to update password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Sheet visible={visible} onClose={onClose} title="Change password">
        <View className="items-center py-8">
          <View className="mb-4 size-14 items-center justify-center rounded-full bg-[#e6f5f0]">
            <Ionicons name="checkmark" size={28} color="#0f7b6c" />
          </View>
          <Text className="text-[17px] font-sans-bold text-primary">
            Password updated
          </Text>
          <Text className="mt-2 text-center text-[14px] font-sans-medium text-muted-foreground">
            Your password has been changed successfully.
          </Text>
          <Pressable
            className="mt-6 w-full items-center rounded-full bg-primary py-4"
            onPress={onClose}
          >
            <Text className="text-[15px] font-sans-bold text-white">
              Done
            </Text>
          </Pressable>
        </View>
      </Sheet>
    );
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Change password">
      {/* Current password */}
      <View className="mb-4">
        <Text className="mb-2 text-[13px] font-sans-semibold text-primary">
          Current password
        </Text>
        <View className="flex-row items-center rounded-xl border border-[#e5e5e5] bg-white px-4">
          <TextInput
            className="min-h-[48px] flex-1 text-[15px] font-sans-medium text-primary"
            placeholderTextColor="rgba(55, 53, 47, 0.35)"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            secureTextEntry={!showCurrent}
            autoCapitalize="none"
          />
          <Pressable onPress={() => setShowCurrent((p) => !p)}>
            <Ionicons
              name={showCurrent ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#999"
            />
          </Pressable>
        </View>
      </View>

      {/* New password */}
      <View className="mb-4">
        <Text className="mb-2 text-[13px] font-sans-semibold text-primary">
          New password
        </Text>
        <View className="flex-row items-center rounded-xl border border-[#e5e5e5] bg-white px-4">
          <TextInput
            className="min-h-[48px] flex-1 text-[15px] font-sans-medium text-primary"
            placeholderTextColor="rgba(55, 53, 47, 0.35)"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Min. 8 characters"
            secureTextEntry={!showNew}
            autoCapitalize="none"
          />
          <Pressable onPress={() => setShowNew((p) => !p)}>
            <Ionicons
              name={showNew ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#999"
            />
          </Pressable>
        </View>
      </View>

      {/* Confirm password */}
      <View className="mb-4">
        <Text className="mb-2 text-[13px] font-sans-semibold text-primary">
          Confirm new password
        </Text>
        <View className="flex-row items-center rounded-xl border border-[#e5e5e5] bg-white px-4">
          <TextInput
            className="min-h-[48px] flex-1 text-[15px] font-sans-medium text-primary"
            placeholderTextColor="rgba(55, 53, 47, 0.35)"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter new password"
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
          />
          <Pressable onPress={() => setShowConfirm((p) => !p)}>
            <Ionicons
              name={showConfirm ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#999"
            />
          </Pressable>
        </View>
      </View>

      {/* Error */}
      {error ? (
        <View className="mb-4 flex-row items-center gap-2">
          <View className="size-1.5 rounded-full bg-destructive" />
          <Text className="flex-1 text-[12px] font-sans-medium text-destructive">
            {error}
          </Text>
        </View>
      ) : null}

      {/* Update button */}
      <Pressable
        className={`mt-2 items-center rounded-full bg-primary py-4 ${loading ? "opacity-60" : ""}`}
        onPress={handleUpdate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text className="text-[15px] font-sans-bold text-white">
            Update password
          </Text>
        )}
      </Pressable>
    </Sheet>
  );
}
