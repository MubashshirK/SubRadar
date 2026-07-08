import { icons } from "@/constants/icons";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import {
  getLogoUrl,
  searchServices,
  type ServiceCategory,
  type ServiceEntry,
} from "@/lib/logo";
import DatePicker from "@/components/DatePicker";
import { CURRENCIES } from "@/lib/settingsStore";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { useTheme } from "@/lib/useThemeSync";
import { CATEGORY_MAP, CATEGORY_NAMES } from "@/constants/categories";
import { shadowSheet, shadowDropdown } from "@/constants/shadows";
dayjs.extend(customParseFormat);

type Frequency = "Monthly" | "Yearly";

function isNumericPrice(value: string): boolean {
  if (!value.trim()) return false;
  if (!/^\d+(\.\d+)?$/.test(value.trim())) return false;
  const parsed = parseFloat(value);
  return !isNaN(parsed) && parsed > 0;
}

function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
  initialSubscription?: Subscription;
}

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onSubmit,
  initialSubscription,
}: CreateSubscriptionModalProps) => {
  const isEditing = !!initialSubscription;
  const { data: settings } = useUserSettings();
  const settingsCurrency = settings?.currency ?? "USD";
  const [subscriptionCurrency, setSubscriptionCurrency] = useState<string | undefined>(
    initialSubscription?.currency ?? undefined,
  );
  const effectiveCurrency = subscriptionCurrency ?? settingsCurrency;
  const currencySymbol = CURRENCIES.find((c) => c.code === effectiveCurrency)?.symbol || "$";
  const { isDark } = useTheme();
  const [name, setName] = useState(initialSubscription?.name ?? "");
  const [price, setPrice] = useState(initialSubscription ? String(initialSubscription.price) : "");
  const [frequency, setFrequency] = useState<Frequency>(
    (initialSubscription?.frequency as Frequency) ?? "Monthly",
  );
  const [category, setCategory] = useState<ServiceCategory>(
    (initialSubscription?.category as ServiceCategory) ?? "Other",
  );
  const [domain, setDomain] = useState(initialSubscription?.domain ?? "");
  const [customDomain, setCustomDomain] = useState("");
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [suggestions, setSuggestions] = useState<ServiceEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDetails, setShowDetails] = useState(isEditing);
  const [plan, setPlan] = useState(initialSubscription?.plan ?? "");
  const [paymentMethod, setPaymentMethod] = useState(initialSubscription?.paymentMethod ?? "");
  const [startDateStr, setStartDateStr] = useState(
    initialSubscription?.startDate
      ? dayjs(initialSubscription.startDate).format("MM/DD/YYYY")
      : dayjs().format("MM/DD/YYYY"),
  );
  const [manualRenewalStr, setManualRenewalStr] = useState(
    initialSubscription?.renewalDate
      ? dayjs(initialSubscription.renewalDate).format("MM/DD/YYYY")
      : "",
  );
  const [renewalManuallyEdited, setRenewalManuallyEdited] = useState(!!initialSubscription?.renewalDate);
  const nameInputRef = useRef<TextInput>(null);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showRenewalDatePicker, setShowRenewalDatePicker] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { height: screenHeight } = useWindowDimensions();
  const cardMaxHeight = screenHeight * 0.88;

  const cardTranslateY = useSharedValue(screenHeight);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const isValidForm = name.trim() !== "" && isNumericPrice(price);

  const effectiveDomain = domain || customDomain;

  const priceValue = isNumericPrice(price) ? parseFloat(price) : 0;

  const displayCostLabel = useMemo(() => {
    if (!isValidForm) return "";
    return ` — ${formatCurrency(priceValue, effectiveCurrency)}/${frequency === "Monthly" ? "mo" : "yr"}`;
  }, [isValidForm, priceValue, frequency, effectiveCurrency]);

  const calculatedRenewal = useMemo(() => {
    const parsed = dayjs(startDateStr, "MM/DD/YYYY", true);
    if (!parsed.isValid()) return "";
    const added =
      frequency === "Monthly" ? parsed.add(1, "month") : parsed.add(1, "year");
    return added.format("MM/DD/YYYY");
  }, [startDateStr, frequency]);

  const renewalDateStr = renewalManuallyEdited
    ? manualRenewalStr
    : calculatedRenewal;

  useEffect(() => {
    if (visible && !initialSubscription) {
      const timer = setTimeout(() => nameInputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [visible, initialSubscription]);

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsModalVisible(true);
      cardTranslateY.value = withTiming(0, {
        duration: 350,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      cardTranslateY.value = withTiming(screenHeight, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
      const timer = setTimeout(() => {
        setIsModalVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible, cardTranslateY, screenHeight]);

  const handleClose = () => {
    onClose();
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (showDetails) setShowDetails(false);
    if (text.trim().length > 0) {
      const results = searchServices(text);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectService = (service: ServiceEntry) => {
    setName(service.name);
    setDomain(service.domain);
    setCategory(service.category);
    setShowSuggestions(false);
    setSuggestions([]);
    setShowCustomDomain(false);
    setCustomDomain("");
  };

  const handleShowCustomDomain = () => {
    setShowCustomDomain(true);
    setDomain("");
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (!isValidForm) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const priceVal = parseFloat(price);
    const startParsed = dayjs(startDateStr, "MM/DD/YYYY", true);
    const finalStartDate = startParsed.isValid() ? startParsed : dayjs();

    const renewalParsed = dayjs(renewalDateStr, "MM/DD/YYYY", true);
    const finalRenewalDate = renewalParsed.isValid()
      ? renewalParsed
      : frequency === "Monthly"
        ? finalStartDate.add(1, "month")
        : finalStartDate.add(1, "year");

    let finalDomain = effectiveDomain;
    let finalCategory = category;
    if (!finalDomain) {
      const match = searchServices(name);
      if (match.length > 0) {
        finalDomain = match[0].domain;
        if (!finalCategory || finalCategory === "Other") {
          finalCategory = match[0].category;
        }
      }
    }

    const newSubscription: Subscription = {
      id: initialSubscription?.id ?? `sub-${Date.now()}`,
      name: name.trim(),
      price: priceVal,
      currency: effectiveCurrency,
      frequency,
      category: finalCategory,
      status: "active",
      startDate: finalStartDate.toISOString(),
      renewalDate: finalRenewalDate.toISOString(),
      icon: effectiveDomain ? { uri: getLogoUrl(effectiveDomain, 128) } : icons.plus,
      billing: frequency,
      color: CATEGORY_MAP[finalCategory]?.color ?? CATEGORY_MAP.Other?.color,
      domain: finalDomain,
      plan: plan.trim() || undefined,
      paymentMethod: paymentMethod.trim() || undefined,
    };

    onSubmit(newSubscription);
    onClose();
  };

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
            onPress={handleClose}
          />
          <Animated.View
            style={[
              {
                maxHeight: cardMaxHeight,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
              shadowSheet,
              cardAnimatedStyle,
            ]}
            className="overflow-hidden bg-background dark:bg-card"
          >
            {/* Drag Handle */}
            <View className="w-9 h-1 rounded-full bg-black/10 dark:bg-white/20 self-center mt-2 mb-4" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pb-4 border-b border-border/60">
               <Text className="text-sheet-title">
                {isEditing ? "Edit Subscription" : "New Subscription"}
              </Text>
              <Pressable
                onPress={handleClose}
                className="size-8 items-center justify-center rounded-full bg-muted"
              >
                <Ionicons name="close" size={16} color={isDark ? "#ccc" : "#666"} />
              </Pressable>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={{ flexGrow: 0, flexShrink: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, gap: 16 }}
            >
              {/* Service Name */}
              <View>
                <Text className="text-overline mb-2">
                  Service Name
                </Text>
                <View className="relative">
                  <TextInput
                    ref={nameInputRef}
                    className="bg-muted rounded-xl py-3.5 text-base font-sans-medium text-primary"
                    style={{ paddingHorizontal: 16 }}
                    placeholder="e.g. Netflix, Spotify, GitHub"
                    placeholderTextColor={isDark ? "rgba(237, 237, 237, 0.35)" : "rgba(55, 53, 47, 0.35)"}
                    value={name}
                    onChangeText={handleNameChange}
                    onFocus={() => {
                      if (showDetails) setShowDetails(false);
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                  />

                  {/* Autocomplete Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <View
                      className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-border/60 bg-white dark:bg-card"
                      style={shadowDropdown}
                    >
                      {suggestions.map((service) => (
                        <Pressable
                          key={service.domain}
                          onPress={() => handleSelectService(service)}
                          className="flex-row items-center gap-3 px-4 py-3 border-b border-border/30 last:border-b-0"
                        >
                          <Image
                            source={{ uri: getLogoUrl(service.domain, 64) }}
                            className="size-8 rounded-md"
                            contentFit="contain"
                          />
                          <View className="flex-1">
                            <Text className="text-sm font-sans-semibold text-primary">
                              {service.name}
                            </Text>
                            <Text className="text-xs font-sans-medium text-muted-foreground">
                              {service.domain}
                            </Text>
                          </View>
                          <View
                            className="rounded-full px-2 py-0.5"
                            style={{
                              backgroundColor:
                                CATEGORY_MAP[service.category]?.lightColor ?? "#f3f4f6",
                            }}
                          >
                            <Text
                              className="text-[10px] font-sans-semibold"
                              style={{
                                color: CATEGORY_MAP[service.category]?.color ?? "#6b7280",
                              }}
                            >
                              {service.category}
                            </Text>
                          </View>
                        </Pressable>
                      ))}

                      {/* Custom Domain Option */}
                      <Pressable
                        onPress={handleShowCustomDomain}
                        className="flex-row items-center gap-3 px-4 py-3 bg-muted/50"
                      >
                        <View className="size-8 items-center justify-center rounded-md bg-muted">
                          <Ionicons
                            name="globe-outline"
                            size={16}
                  color={isDark ? "#888" : "#999"}
                          />
                        </View>
                        <Text className="text-sm font-sans-medium text-muted-foreground">
                          Enter custom domain...
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>

              {/* Custom Domain Input */}
              {showCustomDomain && (
                <View>
                  <Text className="text-overline mb-2">
                    Domain
                  </Text>
                  <TextInput
                    className="bg-muted rounded-xl py-3.5 text-base font-sans-medium text-primary"
                    style={{ paddingHorizontal: 16 }}
                    placeholder="e.g. netflix.com"
                    placeholderTextColor={isDark ? "rgba(237, 237, 237, 0.35)" : "rgba(55, 53, 47, 0.35)"}
                    value={customDomain}
                    onChangeText={setCustomDomain}
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}

              {/* Selected Domain Display */}
              {domain && !showCustomDomain && (
                <View className="flex-row items-center gap-2 bg-muted/50 rounded-xl px-4 py-3">
                  <Image
                    source={{ uri: getLogoUrl(domain, 64) }}
                    className="size-6 rounded"
                    contentFit="contain"
                  />
                  <Text className="text-sm font-sans-medium text-muted-foreground flex-1">
                    {domain}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setDomain("");
                      setShowCustomDomain(true);
                    }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={isDark ? "rgba(237, 237, 237, 0.3)" : "rgba(55, 53, 47, 0.3)"}
                    />
                  </Pressable>
                </View>
              )}

              {/* Price */}
              <View>
                <Text className="text-overline mb-2">
                  Price
                </Text>
                <View
                  className="flex-row items-center bg-muted rounded-xl py-3.5"
                  style={{ paddingHorizontal: 16 }}
                >
                  <Text className="text-base font-sans-semibold text-muted-foreground mr-1">
                    {currencySymbol}
                  </Text>
                  <TextInput
                    className="flex-1 bg-transparent text-base font-sans-medium text-primary"
                    placeholder="0.00"
                    placeholderTextColor={isDark ? "rgba(237, 237, 237, 0.35)" : "rgba(55, 53, 47, 0.35)"}
                    value={price}
                    onChangeText={(t) => {
                      setPrice(t);
                      if (showDetails) setShowDetails(false);
                    }}
                    onFocus={() => {
                      if (showDetails) setShowDetails(false);
                    }}
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
                        ? "border-primary bg-primary dark:bg-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    <Ionicons
                      name={
                        f === "Monthly" ? "repeat-outline" : "calendar-outline"
                      }
                      size={14}
                      color={frequency === f ? (isDark ? "#191919" : "#fff") : "#555"}
                    />
                    <Text
                      className={clsx(
                        "text-sm font-sans-semibold",
                        frequency === f
                          ? "text-white dark:text-background"
                          : "text-muted-foreground",
                      )}
                    >
                      {f}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* More Details Toggle */}
              <Pressable
                onPress={() => setShowDetails(!showDetails)}
                className="flex-row items-center gap-2 py-1"
              >
                <Ionicons
                  name={showDetails ? "chevron-down" : "chevron-forward"}
                  size={16}
                  color="#999"
                />
                <Text className="text-sm font-sans-semibold text-muted-foreground">
                  More details
                </Text>
                {!showDetails && (
                  <Text className="text-xs font-sans-medium text-muted-foreground/60 ml-1">
                    (optional)
                  </Text>
                )}
              </Pressable>

              {/* Collapsible Details Section */}
              {showDetails && (
                <View className="gap-4">
                  {/* Category */}
                  <View>
                    <Text className="text-overline mb-2">
                      Category
                    </Text>
                    <View className="flex-row flex-wrap gap-1.5">
                      {CATEGORY_NAMES.map((cat) => (
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

                  {/* Plan */}
                  <View>
                    <Text className="text-overline mb-2">
                      Plan
                    </Text>
                    <TextInput
                      className="bg-muted rounded-xl py-3.5 text-base font-sans-medium text-primary"
                      style={{ paddingHorizontal: 16 }}
                      placeholder="e.g. Pro Plan, Teams Plan"
                      placeholderTextColor={isDark ? "rgba(237, 237, 237, 0.35)" : "rgba(55, 53, 47, 0.35)"}
                      value={plan}
                      onChangeText={setPlan}
                    />
                  </View>

                  {/* Payment Method */}
                  <View>
                    <Text className="text-overline mb-2">
                      Payment Method
                    </Text>
                    <TextInput
                      className="bg-muted rounded-xl py-3.5 text-base font-sans-medium text-primary"
                      style={{ paddingHorizontal: 16 }}
                      placeholder="e.g. Visa ending in 8530"
                      placeholderTextColor={isDark ? "rgba(237, 237, 237, 0.35)" : "rgba(55, 53, 47, 0.35)"}
                      value={paymentMethod}
                      onChangeText={setPaymentMethod}
                    />
                  </View>

                  {/* Start Date */}
                  <View>
                    <Text className="text-overline mb-2">
                      Start Date
                    </Text>
                    <Pressable
                      onPress={() => setShowStartDatePicker(true)}
                      className="flex-row items-center justify-between bg-muted rounded-xl px-4 py-3.5"
                    >
                      <Text className="text-base font-sans-medium text-primary">
                        {startDateStr}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={isDark ? "rgba(237, 237, 237, 0.4)" : "rgba(55, 53, 47, 0.4)"}
                      />
                    </Pressable>
                  </View>

                  {/* Renewal Date */}
                  <View>
                    <View className="flex-row items-center justify-between mb-2">
                       <Text className="text-overline">
                        Renewal Date
                      </Text>
                      {renewalManuallyEdited && (
                        <Pressable
                          onPress={() => {
                            setManualRenewalStr("");
                            setRenewalManuallyEdited(false);
                          }}
                        >
                          <Text className="text-xs font-sans-semibold text-primary">
                            Reset to auto
                          </Text>
                        </Pressable>
                      )}
                    </View>
                    <Pressable
                      onPress={() => setShowRenewalDatePicker(true)}
                      className="flex-row items-center justify-between bg-muted rounded-xl px-4 py-3.5"
                    >
                      <Text className="text-base font-sans-medium text-primary">
                        {renewalDateStr || "—"}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={isDark ? "rgba(237, 237, 237, 0.4)" : "rgba(55, 53, 47, 0.4)"}
                      />
                    </Pressable>
                    <Text className="mt-1 text-xs font-sans-medium text-muted-foreground/60">
                      {renewalManuallyEdited
                        ? "Custom renewal date"
                        : `Auto: start date + ${frequency.toLowerCase()} billing`}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Fixed Footer - Create Button */}
            <View style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12 }}>
              <Pressable
                className={clsx(
                  "flex-row items-center justify-center gap-2 rounded-full bg-primary dark:bg-foreground h-14",
                  !isValidForm && "opacity-40",
                )}
                onPress={handleSubmit}
                disabled={!isValidForm}
              >
                <Ionicons name={isEditing ? "checkmark" : "add"} size={20} color={isDark ? "#191919" : "#fff"} />
                <Text className="text-base font-sans-bold text-white dark:text-background">
                  {isEditing ? "Save Changes" : `Create${displayCostLabel}`}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      {/* Start Date Picker */}
      <DatePicker
        visible={showStartDatePicker}
        value={startDateStr}
        title="Start Date"
        onConfirm={(dateStr) => {
          setStartDateStr(dateStr);
          setRenewalManuallyEdited(false);
          setShowStartDatePicker(false);
        }}
        onCancel={() => setShowStartDatePicker(false)}
      />

      {/* Renewal Date Picker */}
      <DatePicker
        visible={showRenewalDatePicker}
        value={renewalDateStr || startDateStr}
        title="Renewal Date"
        minDate={startDateStr}
        onConfirm={(dateStr) => {
          setManualRenewalStr(dateStr);
          setRenewalManuallyEdited(true);
          setShowRenewalDatePicker(false);
        }}
        onCancel={() => setShowRenewalDatePicker(false)}
      />
    </Modal>
  );
};

export default CreateSubscriptionModal;
