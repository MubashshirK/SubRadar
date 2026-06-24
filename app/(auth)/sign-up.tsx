import { useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const CODE_LENGTH = 6;

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const codeInputRef = React.useRef<TextInput>(null);

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
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
    else if (password.length < 8)
      next.password = "Must be at least 8 characters";

    setLocalErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    if (!code.trim()) return;

    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({
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

  const isVerifying =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const isFetching = fetchStatus === "fetching";
  const canSubmit = emailAddress.trim() && password && !isFetching;
  const canVerify = code.trim() && !isFetching;

  if (signUp.status === "complete") return null;

  if (isVerifying) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-background"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow px-6 pb-10 pt-16"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-10">
            <View className="size-16 items-center justify-center rounded-2xl bg-accent mb-5">
              <Text className="text-3xl font-sans-extrabold text-white">S</Text>
            </View>
            <Text className="text-2xl font-sans-bold text-primary">
              SubRadar
            </Text>
            <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
              Track. Manage. Save.
            </Text>
          </View>

          <View className="rounded-3xl border border-border bg-card p-7">
            <Text className="text-2xl font-sans-bold text-primary mb-2">
              Check your inbox
            </Text>
            <Text className="text-base font-sans-medium text-muted-foreground mb-8 leading-5">
              We sent a verification code to{"\n"}
              <Text className="font-sans-bold text-primary">
                {emailAddress}
              </Text>
            </Text>

            <Pressable onPress={() => codeInputRef.current?.focus()}>
              <View className="flex-row justify-center gap-2.5 mb-7">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                  <View
                    key={i}
                    className={`size-13 rounded-2xl border-2 items-center justify-center
                      ${code[i] ? "border-accent bg-accent/5" : "border-border bg-background"}
                      ${code.length === i && code.length < CODE_LENGTH ? "border-accent/40" : ""}`}
                  >
                    <Text className="text-2xl font-sans-bold text-primary">
                      {code[i] || ""}
                    </Text>
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
              <View className="flex-row items-center gap-2 mb-4">
                <View className="size-1.5 rounded-full bg-destructive" />
                <Text className="text-xs font-sans-medium text-destructive flex-1">
                  {errors.fields.code.message}
                </Text>
              </View>
            )}

            <Pressable
              className={`flex-row items-center justify-center gap-2 rounded-2xl bg-accent py-4 ${!canVerify ? "opacity-40" : ""}`}
              onPress={handleVerify}
              disabled={!canVerify}
            >
              {isFetching && <ActivityIndicator size="small" color="#fff" />}
              <Text className="text-base font-sans-bold text-white">
                {isFetching ? "Verifying…" : "Verify email"}
              </Text>
            </Pressable>

            <Pressable
              className="items-center rounded-2xl border border-accent/25 py-3.5 mt-3"
              onPress={() => signUp.verifications.sendEmailCode()}
              disabled={isFetching}
            >
              <Text className="text-sm font-sans-semibold text-accent">
                Resend code
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-6 pb-10 pt-16"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-10">
          <View className="size-16 items-center justify-center rounded-2xl bg-accent mb-5">
            <Text className="text-3xl font-sans-extrabold text-white">S</Text>
          </View>
          <Text className="text-2xl font-sans-bold text-primary">SubRadar</Text>
          <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
            Track. Manage. Save.
          </Text>
        </View>

        <View className="rounded-3xl border border-border bg-card p-7">
          <Text className="text-2xl font-sans-bold text-primary">
            Create account
          </Text>
          <Text className="text-base font-sans-medium text-muted-foreground mt-1.5 mb-7">
            Start tracking your subscriptions in seconds.
          </Text>

          <View className="gap-5">
            <View>
              <Text className="text-sm font-sans-semibold text-primary mb-2">
                Email
              </Text>
              <TextInput
                className={`rounded-2xl border bg-background px-5 py-4 text-base font-sans-medium text-primary
                  ${localErrors.email || errors.fields.emailAddress ? "border-destructive" : "border-border"}`}
                placeholderTextColor="rgba(55, 53, 47, 0.35)"
                value={emailAddress}
                placeholder="you@example.com"
                onChangeText={(v) => {
                  setEmailAddress(v);
                  if (localErrors.email)
                    setLocalErrors((p) => ({ ...p, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {(localErrors.email || errors.fields.emailAddress) && (
                <View className="flex-row items-center gap-2 mt-2">
                  <View className="size-1.5 rounded-full bg-destructive" />
                  <Text className="text-xs font-sans-medium text-destructive flex-1">
                    {localErrors.email ??
                      errors.fields.emailAddress!.message}
                  </Text>
                </View>
              )}
            </View>

            <View>
              <Text className="text-sm font-sans-semibold text-primary mb-2">
                Password
              </Text>
              <TextInput
                className={`rounded-2xl border bg-background px-5 py-4 text-base font-sans-medium text-primary
                  ${localErrors.password || errors.fields.password ? "border-destructive" : "border-border"}`}
                placeholderTextColor="rgba(55, 53, 47, 0.35)"
                value={password}
                placeholder="At least 8 characters"
                onChangeText={(v) => {
                  setPassword(v);
                  if (localErrors.password)
                    setLocalErrors((p) => ({ ...p, password: undefined }));
                }}
                secureTextEntry
                autoCapitalize="none"
              />
              {(localErrors.password || errors.fields.password) && (
                <View className="flex-row items-center gap-2 mt-2">
                  <View className="size-1.5 rounded-full bg-destructive" />
                  <Text className="text-xs font-sans-medium text-destructive flex-1">
                    {localErrors.password ??
                      errors.fields.password!.message}
                  </Text>
                </View>
              )}
            </View>

            <Pressable
              className={`flex-row items-center justify-center gap-2 rounded-2xl bg-accent py-4 ${!canSubmit ? "opacity-40" : ""}`}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {isFetching && <ActivityIndicator size="small" color="#fff" />}
              <Text className="text-base font-sans-bold text-white">
                {isFetching ? "Creating account…" : "Create account"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="flex-row items-center justify-center gap-1 mt-6">
          <Text className="text-sm font-sans-medium text-muted-foreground">
            Already have an account?
          </Text>
          <Link href="/(auth)/sign-in">
            <Text className="text-sm font-sans-bold text-accent">Sign in</Text>
          </Link>
        </View>

        <View nativeID="clerk-captcha" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
