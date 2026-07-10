import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import { CheckCircle, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
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

const CODE_LENGTH = 6;

export default function ForgotPasswordScreen() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const { isDark } = useTheme();
  const codeInputRef = React.useRef<TextInput>(null);

  const [emailAddress, setEmailAddress] = React.useState("");
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [step, setStep] = React.useState<"email" | "code" | "password" | "done">("email");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const s = signIn as any;

  const sendCode = async () => {
    if (!emailAddress.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { error: createErr } = await s.create({ identifier: emailAddress.trim() });
      if (createErr) {
        setError(createErr.message);
        return;
      }

      const { error: sendErr } = await s.resetPasswordEmailCode.sendCode();
      if (sendErr) {
        setError(sendErr.message);
        return;
      }
      setStep("code");
      setTimeout(() => codeInputRef.current?.focus(), 100);
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code.trim() || code.length < CODE_LENGTH) {
      setError("Enter the complete verification code");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { error: err } = await s.resetPasswordEmailCode.verifyCode({ code: code.trim() });
      if (err) {
        setError(err.message);
        return;
      }
      setStep("password");
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async () => {
    if (!password) {
      setError("Enter a new password");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { error: err } = await s.resetPasswordEmailCode.submitPassword({ password });
      if (err) {
        setError(err.message);
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/(tabs)");
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.replace(url as any);
            }
          },
        });
      } else {
        setStep("done");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Failed to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    signIn.reset();
    setStep("email");
    setEmailAddress("");
    setCode("");
    setPassword("");
    setError("");
  };

  /* ─────────── Done screen ─────────── */
  if (step === "done") {
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
                <CheckCircle size={28} color="#10b981" strokeWidth={1.5} />
              </View>
              <Text className="auth-title text-center">Password reset</Text>
              <Text className="auth-subtitle mt-2 text-center">
                Your password has been reset successfully.
              </Text>

              <Pressable
                className="auth-button mt-8"
                onPress={() => router.back()}
              >
                <Text className="auth-button-text">Back to Sign In</Text>
              </Pressable>

              <Pressable
                className="mt-4 items-center py-2"
                onPress={startOver}
              >
                <Text className="text-[13px] font-sans-medium text-muted-foreground">
                  Reset another account
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    );
  }

  /* ─────────── New password step ─────────── */
  if (step === "password") {
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
              <Text className="auth-title">New password</Text>
              <Text className="auth-subtitle">
                Choose a strong password for your account.
              </Text>

              <View
                className={`auth-input-row mt-6 ${error ? "border-destructive" : ""}`}
              >
                <Lock size={20} color="#999" strokeWidth={1.5} />
                <TextInput
                  className="auth-input"
                  placeholder="New password"
                  placeholderTextColor={isDark ? "rgba(237, 237, 237, 0.35)" : "rgba(55, 53, 47, 0.35)"}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    if (error) setError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoFocus
                />
                <Pressable
                  className="auth-eye"
                  onPress={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? (
                    <Eye size={20} color="#999" strokeWidth={1.5} />
                  ) : (
                    <EyeOff size={20} color="#999" strokeWidth={1.5} />
                  )}
                </Pressable>
              </View>
              {error ? (
                <View className="mt-2 flex-row items-center gap-2">
                  <View className="size-1.5 rounded-full bg-destructive" />
                  <Text className="flex-1 text-[12px] font-sans-medium text-destructive">{error}</Text>
                </View>
              ) : null}

              <Pressable
                className={`auth-button mt-8 ${loading ? "auth-button-disabled" : ""}`}
                onPress={submitPassword}
                disabled={loading}
              >
                <Text className="auth-button-text">
                  {loading ? "Resetting\u2026" : "Reset Password"}
                </Text>
              </Pressable>

              <Pressable
                className="mt-4 items-center py-2"
                onPress={startOver}
              >
                <Text className="text-[13px] font-sans-medium text-muted-foreground">
                  Start over
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    );
  }

  /* ─────────── Code step ─────────── */
  if (step === "code") {
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
              <Text className="auth-title">Check your email</Text>
              <Text className="auth-subtitle mt-2">
                Enter the 6-digit verification code sent to{"\n"}
                <Text className="font-sans-semibold text-primary">
                  {emailAddress}
                </Text>
              </Text>

              <Pressable onPress={() => codeInputRef.current?.focus()}>
                <View className="auth-code-row mt-8">
                  {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                    <View
                      key={i}
                      className={`auth-code-box ${
                        code[i]
                          ? "auth-code-box-filled"
                          : code.length === i && code.length < CODE_LENGTH
                            ? "auth-code-box-active"
                            : ""
                      }`}
                    >
                      <Text className="auth-code-digit">{code[i] || ""}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>

              <TextInput
                ref={codeInputRef}
                className="absolute opacity-0"
                value={code}
                onChangeText={(t) => {
                  setCode(t.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH));
                  if (error) setError("");
                }}
                keyboardType="number-pad"
                maxLength={CODE_LENGTH}
                autoFocus
              />

              {error ? (
                <View className="mt-4 flex-row items-center gap-2">
                  <View className="size-1.5 rounded-full bg-destructive" />
                  <Text className="flex-1 text-[12px] font-sans-medium text-destructive">{error}</Text>
                </View>
              ) : null}

              <Pressable
                className={`auth-button mt-8 ${loading || code.length < CODE_LENGTH ? "auth-button-disabled" : ""}`}
                onPress={verifyCode}
                disabled={loading || code.length < CODE_LENGTH}
              >
                <Text className="auth-button-text">
                  {loading ? "Verifying\u2026" : "Verify"}
                </Text>
              </Pressable>

              <Pressable
                className="auth-secondary-button mt-4"
                onPress={sendCode}
                disabled={loading}
              >
                <Text className="auth-secondary-button-text">Resend code</Text>
              </Pressable>

              <Pressable
                className="items-center py-4"
                onPress={startOver}
              >
                <Text className="text-[13px] font-sans-medium text-muted-foreground">
                  Start over
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    );
  }

  /* ─────────── Email step ─────────── */
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
              Enter your email and we{"'"}ll send you a verification code.
            </Text>

            <View
              className={`auth-input-row mt-6 ${error ? "border-destructive" : ""}`}
            >
              <Mail size={20} color="#999" strokeWidth={1.5} />
              <TextInput
                className="auth-input"
                placeholder="Email Address"
                placeholderTextColor={isDark ? "rgba(237, 237, 237, 0.35)" : "rgba(55, 53, 47, 0.35)"}
                value={emailAddress}
                onChangeText={(v) => {
                  setEmailAddress(v);
                  if (error) setError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {error ? (
              <View className="mt-2 flex-row items-center gap-2">
                <View className="size-1.5 rounded-full bg-destructive" />
                <Text className="flex-1 text-[12px] font-sans-medium text-destructive">{error}</Text>
              </View>
            ) : null}

            <Pressable
              className={`auth-button mt-8 ${loading ? "auth-button-disabled" : ""}`}
              onPress={sendCode}
              disabled={loading}
            >
              <Text className="auth-button-text">
                {loading ? "Sending\u2026" : "Send Reset Code"}
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
