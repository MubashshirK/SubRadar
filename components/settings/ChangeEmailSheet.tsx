import { useUser } from "@clerk/expo";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Sheet from "./Sheet";

const CODE_LENGTH = 6;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ChangeEmailSheet({ visible, onClose }: Props) {
  const { user } = useUser();
  const codeInputRef = React.useRef<TextInput>(null);

  const [step, setStep] = React.useState<"email" | "verify">("email");
  const [newEmail, setNewEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [emailAddressId, setEmailAddressId] = React.useState<string | null>(
    null,
  );

  const currentEmail = user?.primaryEmailAddress?.emailAddress || "";

  React.useEffect(() => {
    if (visible) {
      setStep("email");
      setNewEmail("");
      setCode("");
      setError("");
      setEmailAddressId(null);
    }
  }, [visible]);

  const handleSendCode = async () => {
    if (!newEmail.trim()) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setError("Enter a valid email address");
      return;
    }

    if (newEmail.trim().toLowerCase() === currentEmail.toLowerCase()) {
      setError("This is already your current email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const emailAddress = await user?.createEmailAddress({
        email: newEmail.trim(),
      });

      if (!emailAddress) {
        setError("Failed to create email address");
        return;
      }

      setEmailAddressId(emailAddress.id);

      await emailAddress.prepareVerification({ strategy: "email_code" });

      setStep("verify");
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.message || err?.message || "Failed to send code";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim() || !emailAddressId) return;

    setLoading(true);
    setError("");

    try {
      const emailAddress = user?.emailAddresses?.find(
        (e) => e.id === emailAddressId,
      );

      if (!emailAddress) {
        setError("Email address not found");
        return;
      }

      await emailAddress.attemptVerification({ code: code.trim() });

      onClose();
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.message || err?.message || "Invalid verification code";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!emailAddressId) return;

    try {
      const emailAddress = user?.emailAddresses?.find(
        (e) => e.id === emailAddressId,
      );
      await emailAddress?.prepareVerification({ strategy: "email_code" });
    } catch {
      // Silently fail on resend
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={step === "email" ? "Change email" : "Verify email"}
    >
      {step === "email" ? (
        <>
          {/* Current email */}
          {currentEmail ? (
            <View className="mb-5 rounded-xl bg-[#f8f8f8] px-4 py-3">
              <Text className="text-[12px] font-sans-medium text-muted-foreground">
                Current email
              </Text>
              <Text className="mt-1 text-[14px] font-sans-semibold text-primary">
                {currentEmail}
              </Text>
            </View>
          ) : null}

          {/* New email */}
          <View className="mb-4">
            <Text className="mb-2 text-[13px] font-sans-semibold text-primary">
              New email address
            </Text>
            <TextInput
              className="rounded-xl border border-[#e5e5e5] bg-white pl-4 pr-11 py-3.5 text-[15px] font-sans-medium text-primary"
              placeholderTextColor="rgba(55, 53, 47, 0.35)"
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
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

          {/* Send code button */}
          <Pressable
            className={`mt-2 items-center rounded-full bg-primary py-4 ${loading ? "opacity-60" : ""}`}
            onPress={handleSendCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-[15px] font-sans-bold text-white">
                Send verification code
              </Text>
            )}
          </Pressable>
        </>
      ) : (
        <>
          {/* Code prompt */}
          <Text className="mb-1 text-[14px] font-sans-medium text-muted-foreground">
            Enter the 6-digit code sent to
          </Text>
          <Text className="mb-6 text-[14px] font-sans-semibold text-primary">
            {newEmail}
          </Text>

          {/* Code input boxes */}
          <Pressable onPress={() => codeInputRef.current?.focus()}>
            <View className="mb-6 flex-row items-center justify-center gap-3">
              {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                <View
                  key={i}
                  className={`size-12 items-center justify-center rounded-xl border-2 ${
                    code[i]
                      ? "border-primary bg-primary/5"
                      : code.length === i && code.length < CODE_LENGTH
                        ? "border-primary/40 border-[#e5e5e5]"
                        : "border-[#e5e5e5]"
                  } bg-white`}
                >
                  <Text className="text-xl font-sans-bold text-primary">
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

          {/* Error */}
          {error ? (
            <View className="mb-4 flex-row items-center gap-2">
              <View className="size-1.5 rounded-full bg-destructive" />
              <Text className="flex-1 text-[12px] font-sans-medium text-destructive">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Verify button */}
          <Pressable
            className={`items-center rounded-full bg-primary py-4 ${(!code.trim() || loading) ? "opacity-60" : ""}`}
            onPress={handleVerify}
            disabled={!code.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-[15px] font-sans-bold text-white">
                Verify email
              </Text>
            )}
          </Pressable>

          {/* Resend */}
          <Pressable
            className="mt-4 items-center py-2"
            onPress={handleResend}
          >
            <Text className="text-[13px] font-sans-semibold text-primary">
              Resend code
            </Text>
          </Pressable>

          {/* Change email */}
          <Pressable
            className="items-center py-2"
            onPress={() => {
              setStep("email");
              setCode("");
              setError("");
            }}
          >
            <Text className="text-[13px] font-sans-medium text-muted-foreground">
              Change email address
            </Text>
          </Pressable>
        </>
      )}
    </Sheet>
  );
}
