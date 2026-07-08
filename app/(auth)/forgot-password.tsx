import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import { Image } from "expo-image";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import appIconLight from "@/assets/app-icon.png";
import appIconDark from "@/assets/app-icon-dark.png";
import { useTheme } from "@/lib/useThemeSync";

export default function ForgotPasswordScreen() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const { isDark } = useTheme();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [localError, setLocalError] = React.useState<string>("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "sent">("idle");

  const validate = (): boolean => {
    if (!emailAddress.trim()) {
      setLocalError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())) {
      setLocalError("Enter a valid email address");
      return false;
    }
    setLocalError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setStatus("loading");
    try {
      await signIn.createPasswordReset({ emailAddress: emailAddress.trim() });
      setStatus("sent");
    } catch (err: any) {
      setLocalError(err?.errors?.[0]?.message || "Something went wrong. Try again.");
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white dark:bg-background"
      >
        <View className="flex-1 justify-between">
          <ScrollView
            className="flex-1"
            contentContainerClassName="grow items-center justify-center px-8"
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-full max-w-[360px] items-center">
              <View className="size-16 items-center justify-center rounded-full bg-success/10 mb-5">
                <Mail size={28} color="#10b981" strokeWidth={1.5} />
              </View>
              <Text className="auth-title text-center">Check your email</Text>
              <Text className="auth-subtitle mt-2 text-center">
                We sent a password reset link to{"\n"}
                <Text className="font-sans-semibold text-primary">
                  {emailAddress}
                </Text>
              </Text>

              <Pressable
                className="auth-button mt-8"
                onPress={() => router.back()}
              >
                <Text className="auth-button-text">Back to Sign In</Text>
              </Pressable>

              <Pressable
                className="mt-4 items-center py-2"
                onPress={() => {
                  setStatus("idle");
                  setEmailAddress("");
                }}
              >
                <Text className="text-[13px] font-sans-medium text-muted-foreground">
                  Use a different email
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white dark:bg-background"
    >
      <View className="flex-1 justify-between">
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow items-center justify-center px-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-[360px]">
            <View className="items-center mb-8">
              <Image source={isDark ? appIconDark : appIconLight} contentFit="contain" style={{ width: 72, height: 72 }} />
            </View>
            <Text className="auth-title">Reset password</Text>
            <Text className="auth-subtitle">
              Enter your email and we{"'"}ll send you a reset link.
            </Text>

            <View
              className={`auth-input-row mt-6 ${localError ? "border-destructive" : ""}`}
            >
              <Mail size={20} color="#999" strokeWidth={1.5} />
              <TextInput
                className="auth-input"
                placeholder="Email Address"
                placeholderTextColor={isDark ? "rgba(237, 237, 237, 0.35)" : "rgba(55, 53, 47, 0.35)"}
                value={emailAddress}
                onChangeText={(v) => {
                  setEmailAddress(v);
                  if (localError) setLocalError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {localError ? (
              <View className="mt-2 flex-row items-center gap-2">
                <View className="size-1.5 rounded-full bg-destructive" />
                <Text className="auth-error flex-1">{localError}</Text>
              </View>
            ) : null}

            <Pressable
              className={`auth-button mt-8 ${status === "loading" ? "auth-button-disabled" : ""}`}
              onPress={handleSubmit}
              disabled={status === "loading"}
            >
              <Text className="auth-button-text">
                {status === "loading" ? "Sending\u2026" : "Send Reset Link"}
              </Text>
            </Pressable>

            <Pressable
              className="mt-4 items-center py-2"
              onPress={() => router.back()}
            >
              <Text className="text-[13px] font-sans-medium text-muted-foreground">
                Back to Sign In
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
