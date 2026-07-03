import { icons } from "@/constants/icons";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import dayjs from "dayjs";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

type Frequency = "Monthly" | "Yearly";

const CATEGORIES: ServiceCategory[] = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud Storage",
  "Music",
  "Video",
  "News",
  "Gaming",
  "Education",
  "Shopping",
  "Communication",
  "Security",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#ff6b6b",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#95e1d3",
  "Cloud Storage": "#a8d8ea",
  Music: "#f8b500",
  Video: "#e03e3e",
  News: "#6366f1",
  Gaming: "#10b981",
  Education: "#8b5cf6",
  Finance: "#0ea5e9",
  Shopping: "#f97316",
  Communication: "#06b6d4",
  Security: "#ec4899",
  Other: "#d4d4d4",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

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
  const [category, setCategory] = useState<ServiceCategory>("Other");
  const [domain, setDomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [suggestions, setSuggestions] = useState<ServiceEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [plan, setPlan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [startDateStr, setStartDateStr] = useState(dayjs().format("MM/DD/YYYY"));
  const [manualRenewalStr, setManualRenewalStr] = useState("");
  const [renewalManuallyEdited, setRenewalManuallyEdited] = useState(false);
  const nameInputRef = useRef<TextInput>(null);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showRenewalDatePicker, setShowRenewalDatePicker] = useState(false);

  const { height: screenHeight } = useWindowDimensions();
  const cardMaxHeight = screenHeight * 0.88;

  const isValidForm = name.trim() !== "" && parseFloat(price) > 0;

  const effectiveDomain = domain || customDomain;

  const priceValue = isValidForm ? parseFloat(price) : 0;

  const displayCostLabel = useMemo(() => {
    if (!isValidForm) return "";
    return ` — ${formatCurrency(priceValue)}/${frequency === "Monthly" ? "mo" : "yr"}`;
  }, [isValidForm, priceValue, frequency]);

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
    setDomain("");
    setCustomDomain("");
    setShowCustomDomain(false);
    setSuggestions([]);
    setShowSuggestions(false);
    setShowDetails(false);
    setPlan("");
    setPaymentMethod("");
    setStartDateStr(dayjs().format("MM/DD/YYYY"));
    setManualRenewalStr("");
    setRenewalManuallyEdited(false);
    setShowStartDatePicker(false);
    setShowRenewalDatePicker(false);
  };

  const handleClose = () => {
    resetForm();
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

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
      id: `sub-${Date.now()}`,
      name: name.trim(),
      price: priceVal,
      currency: "USD",
      frequency,
      category: finalCategory,
      status: "active",
      startDate: finalStartDate.toISOString(),
      renewalDate: finalRenewalDate.toISOString(),
      icon: icons.plus,
      billing: frequency,
      color: CATEGORY_COLORS[finalCategory] ?? CATEGORY_COLORS.Other,
      domain: finalDomain,
      plan: plan.trim() || undefined,
      paymentMethod: paymentMethod.trim() || undefined,
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
          <View
            style={{
              maxHeight: cardMaxHeight,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              backgroundColor: "#fff",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 20,
            }}
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
                <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Service Name
                </Text>
                <View className="relative">
                  <TextInput
                    ref={nameInputRef}
                    className="bg-muted rounded-xl py-3.5 text-base font-sans-medium text-primary"
                    style={{ paddingHorizontal: 16 }}
                    placeholder="e.g. Netflix, Spotify, GitHub"
                    placeholderTextColor="rgba(55, 53, 47, 0.35)"
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
                      className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-border/60 bg-white"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 8,
                      }}
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
                                CATEGORY_COLORS[service.category] + "20",
                            }}
                          >
                            <Text
                              className="text-[10px] font-sans-semibold"
                              style={{
                                color: CATEGORY_COLORS[service.category],
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
                            color="#999"
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
                  <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Domain
                  </Text>
                  <TextInput
                    className="bg-muted rounded-xl py-3.5 text-base font-sans-medium text-primary"
                    style={{ paddingHorizontal: 16 }}
                    placeholder="e.g. netflix.com"
                    placeholderTextColor="rgba(55, 53, 47, 0.35)"
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
                      color="rgba(55, 53, 47, 0.3)"
                    />
                  </Pressable>
                </View>
              )}

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
                    <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-2">
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
                    <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Plan
                    </Text>
                    <TextInput
                      className="bg-muted rounded-xl py-3.5 text-base font-sans-medium text-primary"
                      style={{ paddingHorizontal: 16 }}
                      placeholder="e.g. Pro Plan, Teams Plan"
                      placeholderTextColor="rgba(55, 53, 47, 0.35)"
                      value={plan}
                      onChangeText={setPlan}
                    />
                  </View>

                  {/* Payment Method */}
                  <View>
                    <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Payment Method
                    </Text>
                    <TextInput
                      className="bg-muted rounded-xl py-3.5 text-base font-sans-medium text-primary"
                      style={{ paddingHorizontal: 16 }}
                      placeholder="e.g. Visa ending in 8530"
                      placeholderTextColor="rgba(55, 53, 47, 0.35)"
                      value={paymentMethod}
                      onChangeText={setPaymentMethod}
                    />
                  </View>

                  {/* Start Date */}
                  <View>
                    <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-2">
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
                        color="rgba(55, 53, 47, 0.4)"
                      />
                    </Pressable>
                  </View>

                  {/* Renewal Date */}
                  <View>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground">
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
                        color="rgba(55, 53, 47, 0.4)"
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
                  "flex-row items-center justify-center gap-2 rounded-full bg-primary h-14",
                  !isValidForm && "opacity-40",
                )}
                onPress={handleSubmit}
                disabled={!isValidForm}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text className="text-base font-sans-bold text-white">
                  Create{displayCostLabel}
                </Text>
              </Pressable>
            </View>
          </View>
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
