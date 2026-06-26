import { useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
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

const CODE_LENGTH = 6;

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const codeInputRef = React.useRef<TextInput>(null);

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [localErrors, setLocalErrors] = React.useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = (): boolean => {
    const next: { email?: string; password?: string } = {};
    if (!emailAddress.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim()))
      next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    setLocalErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }

          const url = decorateUrl("/(tabs)");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
        },
      });
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (f) => f.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) return;

    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }

          const url = decorateUrl("/(tabs)");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
        },
      });
    }
  };

  const isFetching = fetchStatus === "fetching";
  const canSubmit = emailAddress.trim() && password && !isFetching;
  const canVerify = code.trim() && !isFetching;

  if (signIn.status === "complete") return null;

  /* ─────────── Verification code view ─────────── */
  if (signIn.status === "needs_client_trust") {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
      >
        <View className="flex-1 justify-between">
          <ScrollView
            className="flex-1"
            contentContainerClassName="grow items-center justify-center px-8"
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-full max-w-[360px]">
              <Text className="auth-title">Verify your account</Text>
              <Text className="auth-subtitle mt-2">
                Enter the 6-digit code sent to{"\n"}
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
                onChangeText={(t) =>
                  setCode(t.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH))
                }
                keyboardType="number-pad"
                maxLength={CODE_LENGTH}
                autoFocus
              />

              {errors.fields.code && (
                <View className="mb-4 flex-row items-center gap-2">
                  <View className="size-1.5 rounded-full bg-destructive" />
                  <Text className="auth-error flex-1">
                    {errors.fields.code.message}
                  </Text>
                </View>
              )}

              <Pressable
                className={`auth-button mt-8 ${!canVerify ? "auth-button-disabled" : ""}`}
                onPress={handleVerify}
                disabled={!canVerify}
              >
                <Text className="auth-button-text">Verify</Text>
              </Pressable>

              <Pressable
                className="auth-secondary-button mt-4"
                onPress={() => signIn.mfa.sendEmailCode()}
                disabled={isFetching}
              >
                <Text className="auth-secondary-button-text">Resend code</Text>
              </Pressable>

              <Pressable
                className="items-center py-4"
                onPress={() => signIn.reset()}
                disabled={isFetching}
              >
                <Text className="text-[13px] font-sans-medium text-muted-foreground">
                  Start over
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          <View className="items-center px-8 pb-8 pt-4">
            <Text className="text-center text-[11px] leading-5 font-sans-medium text-muted-foreground">
              By signing in, you agree to our{" "}
              <Text className="font-sans-semibold text-primary">
                Terms of Service
              </Text>{" "}
              and{" "}
              <Text className="font-sans-semibold text-primary">
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  /* ─────────── Sign-in form view ─────────── */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-between">
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow items-center justify-center px-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-[360px]">
            <Text className="auth-title">Sign in</Text>
            <Text className="auth-subtitle">
              New user?{" "}
              <Link href="/(auth)/sign-up">
                <Text className="auth-subtitle-link">Create an account</Text>
              </Link>
            </Text>

            {/* Email input */}
            <View
              className={`auth-input-row ${localErrors.email || errors.fields.identifier ? "border-destructive" : ""}`}
            >
              <Mail size={20} color="#999" strokeWidth={1.5} />
              <TextInput
                className="auth-input"
                placeholder="Email Address"
                placeholderTextColor="rgba(55, 53, 47, 0.35)"
                value={emailAddress}
                onChangeText={(v) => {
                  setEmailAddress(v);
                  if (localErrors.email)
                    setLocalErrors((p) => ({ ...p, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {(localErrors.email || errors.fields.identifier) && (
              <View className="mt-2 flex-row items-center gap-2">
                <View className="size-1.5 rounded-full bg-destructive" />
                <Text className="auth-error flex-1">
                  {localErrors.email ?? errors.fields.identifier!.message}
                </Text>
              </View>
            )}

            {/* Password input */}
            <View
              className={`auth-input-row mt-4 ${localErrors.password || errors.fields.password ? "border-destructive" : ""}`}
            >
              <Lock size={20} color="#999" strokeWidth={1.5} />
              <TextInput
                className="auth-input"
                placeholder="Password"
                placeholderTextColor="rgba(55, 53, 47, 0.35)"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (localErrors.password)
                    setLocalErrors((p) => ({ ...p, password: undefined }));
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
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
            {errors.fields.password && (
              <View className="mt-2 flex-row items-center gap-2">
                <View className="size-1.5 rounded-full bg-destructive" />
                <Text className="auth-error flex-1">
                  {errors.fields.password.message}
                </Text>
              </View>
            )}

            {/* Forgot password */}
            <Pressable className="mt-3 items-end">
              <Text className="text-[13px] font-sans-semibold text-primary">
                Forgot password?
              </Text>
            </Pressable>

            {/* Login button */}
            <Pressable
              className={`auth-button ${!canSubmit ? "auth-button-disabled" : ""}`}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <Text className="auth-button-text">
                {isFetching ? "Signing in\u2026" : "Login"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <View className="items-center px-8 pb-8 pt-4">
          <Text className="text-center text-[11px] leading-5 font-sans-medium text-muted-foreground">
            By signing in, you agree to our{" "}
            <Text className="font-sans-semibold text-primary">
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text className="font-sans-semibold text-primary">
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
