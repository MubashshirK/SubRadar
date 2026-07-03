import { icons } from "@/constants/icons";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import dayjs from "dayjs";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Frequency = "Monthly" | "Yearly";
type Category =
  | "Entertainment"
  | "AI Tools"
  | "Developer Tools"
  | "Design"
  | "Productivity"
  | "Other";

const CATEGORIES: Category[] = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Other",
];

const CATEGORY_EMOJI: Record<Category, string> = {
  Entertainment: "🎬",
  "AI Tools": "🤖",
  "Developer Tools": "💻",
  Design: "🎨",
  Productivity: "📋",
  Other: "📦",
};

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: "#ff6b6b",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#95e1d3",
  Other: "#d4d4d4",
};

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<Category>("Other");
  const nameInputRef = useRef<TextInput>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isValidForm = name.trim() !== "" && parseFloat(price) > 0;

  const monthlyCost = isValidForm
    ? frequency === "Monthly"
      ? parseFloat(price)
      : parseFloat(price) / 12
    : 0;

  const costLabel =
    price && parseFloat(price) > 0
      ? ` — ${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        }).format(monthlyCost)}/${frequency === "Monthly" ? "month" : "year"}`
      : "";

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => nameInputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Other");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValidForm) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const priceValue = parseFloat(price);
    const now = dayjs();
    const renewalDate =
      frequency === "Monthly" ? now.add(1, "month") : now.add(1, "year");

    const newSubscription: Subscription = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      price: priceValue,
      currency: "USD",
      frequency,
      category,
      status: "active",
      startDate: now.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: icons.plus,
      billing: frequency,
      color: CATEGORY_COLORS[category],
    };

    onSubmit(newSubscription);
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={handleClose}
        >
          <Pressable
            className="rounded-t-3xl bg-white pt-2 pb-8"
            style={{
              maxHeight: "88%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 20,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <View className="w-9 h-1 rounded-full bg-black/10 self-center mt-2 mb-4" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pb-4 border-b border-border/60">
              <Text className="text-xl font-sans-bold text-primary">
                New Subscription
              </Text>
              <Pressable
                onPress={handleClose}
                className="size-8 items-center justify-center rounded-full"
              >
                <Ionicons name="close" size={20} color="#191919" />
              </Pressable>
            </View>

            {/* Content */}
            <ScrollView
              className="px-6 pt-6"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                gap: 16,
                paddingBottom: keyboardVisible ? 40 : 0,
              }}
            >
              {/* Name */}
              <View>
                <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Name
                </Text>
                <TextInput
                  ref={nameInputRef}
                  className="bg-muted rounded-xl py-3.5 text-base font-sans-medium text-primary"
                  style={{ paddingHorizontal: 16 }}
                  placeholder="e.g. Netflix"
                  placeholderTextColor="rgba(55, 53, 47, 0.35)"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Price */}
              <View>
                <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Price
                </Text>
                <View
                  className="flex-row items-center bg-muted rounded-xl py-3.5"
                  style={{ paddingHorizontal: 16 }}
                >
                  <Text className="text-base font-sans-semibold text-muted-foreground mr-1">
                    $
                  </Text>
                  <TextInput
                    className="flex-1 bg-transparent text-base font-sans-medium text-primary"
                    placeholder="0.00"
                    placeholderTextColor="rgba(55, 53, 47, 0.35)"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Frequency */}
              <View className="flex-row gap-3">
                {(["Monthly", "Yearly"] as Frequency[]).map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => setFrequency(f)}
                    className={clsx(
                      "flex-1 flex-row items-center justify-center gap-2 rounded-full border py-3",
                      frequency === f
                        ? "border-primary bg-primary"
                        : "border-border bg-card",
                    )}
                  >
                    <Ionicons
                      name={
                        f === "Monthly" ? "repeat-outline" : "calendar-outline"
                      }
                      size={14}
                      color={frequency === f ? "#fff" : "#555"}
                    />
                    <Text
                      className={clsx(
                        "text-sm font-sans-semibold",
                        frequency === f
                          ? "text-white"
                          : "text-muted-foreground",
                      )}
                    >
                      {f}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Category */}
              <View>
                <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Category
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={clsx(
                        "flex-row items-center gap-1 rounded-xl border px-2.5 py-1.5",
                        category === cat
                          ? "border-accent/40 bg-accent/8"
                          : "border-border bg-card",
                      )}
                    >
                      <Text className="text-sm">{CATEGORY_EMOJI[cat]}</Text>
                      <Text
                        className={clsx(
                          "text-sm font-sans-semibold",
                          category === cat
                            ? "text-accent"
                            : "text-muted-foreground",
                        )}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Submit */}
              <Pressable
                className={clsx(
                  "mt-2 flex-row items-center justify-center gap-2 rounded-full bg-primary h-14",
                  !isValidForm && "opacity-40",
                )}
                onPress={handleSubmit}
                disabled={!isValidForm}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text className="text-base font-sans-bold text-white">
                  Create{costLabel}
                </Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
