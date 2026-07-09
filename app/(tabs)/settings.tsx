import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Image, Linking, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { shadowCard } from "@/constants/shadows";
import ErrorBoundary from "@/components/ErrorBoundary";
import { styled } from "nativewind";
import images from "@/constants/images";
import ConfirmDialog from "@/components/ConfirmDialog";
import EditProfileSheet from "@/components/settings/EditProfileSheet";
import ChangePasswordSheet from "@/components/settings/ChangePasswordSheet";
import ChangeEmailSheet from "@/components/settings/ChangeEmailSheet";
import { CURRENCIES, ThemeMode } from "@/lib/settingsStore";
import { useUserSettings, useUpdateUserSettings } from "@/lib/hooks/useUserSettings";
import CurrencyPickerSheet from "@/components/settings/CurrencyPickerSheet";
import ThemePickerSheet from "@/components/settings/ThemePickerSheet";
import { useTheme } from "@/lib/useThemeSync";

const SafeAreaView = styled(RNSafeAreaView);

type IconCircleProps = {
  name: string;
  color: string;
  bg: string;
};

const IconCircle = ({ name, color, bg }: IconCircleProps) => (
  <View
    className="size-8 items-center justify-center rounded-full"
    style={{ backgroundColor: bg }}
  >
    <Ionicons name={name as any} size={16} color={color} />
  </View>
);

type RowProps = {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  description?: string;
  rightElement?: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  onPress?: () => void;
};

const Row = ({
  icon,
  iconColor,
  iconBg,
  label,
  description,
  rightElement,
  isFirst,
  isLast,
  onPress,
}: RowProps) => {
  const borderClass = !isLast ? "border-b border-border" : "";
  const radiusClass = isFirst
    ? "rounded-t-2xl"
    : isLast
      ? "rounded-b-2xl"
      : "";

  return (
    <Pressable
      className={`flex-row items-center gap-3.5 px-4 py-3.5 ${radiusClass} ${borderClass}`}
      onPress={onPress}
    >
      <IconCircle name={icon} color={iconColor} bg={iconBg} />
      <View className="min-w-0 flex-1">
        <Text className="text-[15px] font-sans-medium text-primary">
          {label}
        </Text>
        {description && (
          <Text
            className="mt-0.5 text-[12px] font-sans-medium text-muted-foreground"
            numberOfLines={1}
          >
            {description}
          </Text>
        )}
      </View>
      {rightElement ?? (
        <Ionicons name="chevron-forward" size={16} color="#ccc" />
      )}
    </Pressable>
  );
};

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = React.useState(false);
  const [showEditProfile, setShowEditProfile] = React.useState(false);
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [showChangeEmail, setShowChangeEmail] = React.useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = React.useState(false);
  const [showThemePicker, setShowThemePicker] = React.useState(false);
  const { isDark } = useTheme();

  const { data: settings } = useUserSettings();
  const { mutate: updateSettings } = useUpdateUserSettings();

  const currency = settings?.currency ?? "USD";
  const themeMode = settings?.themeMode ?? "system";
  const billingAlertEnabled = settings?.billingAlertEnabled ?? false;
  const billingAlertDays = settings?.billingAlertDays ?? 3;
  const renewalReminderEnabled = settings?.renewalReminderEnabled ?? false;
  const renewalReminderDays = settings?.renewalReminderDays ?? 1;

  const currencyObj = CURRENCIES.find((c) => c.code === currency);
  const currencyLabel = currencyObj ? `${currencyObj.symbol} ${currencyObj.code}` : currency;

  const themeModeLabel: Record<ThemeMode, string> = {
    system: "System",
    light: "Light",
    dark: "Dark",
  };

  const displayName = user?.fullName || user?.firstName || "User";
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const avatarSource = user?.imageUrl
    ? { uri: user.imageUrl }
    : images.avatar;

  const handleSignOut = async () => {
    setShowSignOutConfirm(true);
  };

  const confirmSignOut = async () => {
    setShowSignOutConfirm(false);
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error("[signOut] error:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <ErrorBoundary>
    <SafeAreaView className="flex-1 bg-background pb-5">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32 pt-6"
      >
        {/* ── Header ── */}
        <Text className="mb-6 text-[28px] font-sans-bold text-primary">
          Settings
        </Text>

        {/* ── Profile Card ── */}
        <Pressable
          className="mb-8 flex-row items-center gap-4 rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-card px-5 py-5"
          style={shadowCard}
        >
          <Image source={avatarSource} className="size-14 rounded-full" />
          <View className="min-w-0 flex-1">
            <Text
              className="text-[17px] font-sans-bold text-primary"
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {email ? (
              <Text
                className="mt-1 text-[13px] font-sans-medium text-muted-foreground"
                numberOfLines={1}
              >
                {email}
              </Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </Pressable>

        {/* ── Account ── */}
        <View className="mb-6">
          <Text className="mb-2 px-1 text-[11px] font-sans-semibold uppercase tracking-[1.5px] text-muted-foreground">
            Account
          </Text>
          <View className="rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-card" style={shadowCard}>
            <Row
              icon="person-outline"
              iconColor="#2f6fed"
              iconBg="#eef3fd"
              label="Edit profile"
              description="Name, avatar, bio"
              isFirst
              onPress={() => setShowEditProfile(true)}
            />
            <Row
              icon="lock-closed-outline"
              iconColor="#0f7b6c"
              iconBg="#e6f5f0"
              label="Change password"
              description="Update your password"
              onPress={() => setShowChangePassword(true)}
            />
            <Row
              icon="mail-outline"
              iconColor="#9a6700"
              iconBg="#fef3cd"
              label="Email address"
              description={email || "Not set"}
              isLast
              onPress={() => setShowChangeEmail(true)}
            />
          </View>
        </View>

        {/* ── Subscriptions ── */}
        <View className="mb-6">
          <Text className="mb-2 px-1 text-[11px] font-sans-semibold uppercase tracking-[1.5px] text-muted-foreground">
            Subscriptions
          </Text>
          <View className="rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-card" style={shadowCard}>
            <Row
              icon="card-outline"
              iconColor="#e03e3e"
              iconBg="#fdecea"
              label="Billing alerts"
              description={billingAlertEnabled ? `Alert ${billingAlertDays} day${billingAlertDays > 1 ? "s" : ""} before renewal` : "Off"}
              rightElement={
                <Switch
                  value={billingAlertEnabled}
                  onValueChange={(value) => updateSettings({ billingAlertEnabled: value })}
                  trackColor={{ false: isDark ? "#3a3a3a" : "#e5e5e5", true: "#e03e3e" }}
                  thumbColor={isDark ? "#ededed" : "#fff"}
                />
              }
              isFirst
            />
            <Row
              icon="notifications-outline"
              iconColor="#ea7a53"
              iconBg="#fdf0ea"
              label="Renewal reminders"
              description={renewalReminderEnabled ? `Remind ${renewalReminderDays} day${renewalReminderDays > 1 ? "s" : ""} before` : "Off"}
              rightElement={
                <Switch
                  value={renewalReminderEnabled}
                  onValueChange={(value) => updateSettings({ renewalReminderEnabled: value })}
                  trackColor={{ false: isDark ? "#3a3a3a" : "#e5e5e5", true: "#ea7a53" }}
                  thumbColor={isDark ? "#ededed" : "#fff"}
                />
              }
            />
            <Row
              icon="globe-outline"
              iconColor="#2f6fed"
              iconBg="#eef3fd"
              label="Default currency"
              rightElement={
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[13px] font-sans-medium text-muted-foreground">
                    {currencyLabel}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </View>
              }
              isLast
              onPress={() => setShowCurrencyPicker(true)}
            />
          </View>
        </View>

        {/* ── Appearance ── */}
        <View className="mb-6">
          <Text className="mb-2 px-1 text-[11px] font-sans-semibold uppercase tracking-[1.5px] text-muted-foreground">
            Appearance
          </Text>
          <View className="rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-card" style={shadowCard}>
            <Row
              icon="moon-outline"
              iconColor="#191919"
              iconBg="#efefed"
              label="Dark mode"
              rightElement={
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[13px] font-sans-medium text-muted-foreground">
                    {themeModeLabel[themeMode]}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </View>
              }
              isFirst
              isLast
              onPress={() => setShowThemePicker(true)}
            />
          </View>
        </View>

        {/* ── Support ── */}
        <View className="mb-6">
          <Text className="mb-2 px-1 text-[11px] font-sans-semibold uppercase tracking-[1.5px] text-muted-foreground">
            Support
          </Text>
          <View className="rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-card" style={shadowCard}>
            <Row
              icon="help-circle-outline"
              iconColor="#2f6fed"
              iconBg="#eef3fd"
              label="Help center"
              description="FAQs and guides"
              isFirst
              onPress={() => Linking.openURL("https://subradar.app/help")}
            />
            <Row
              icon="chatbubble-outline"
              iconColor="#0f7b6c"
              iconBg="#e6f5f0"
              label="Contact us"
              description="Send us a message"
              onPress={() => Linking.openURL("mailto:support@subradar.app")}
            />
            <Row
              icon="bug-outline"
              iconColor="#e03e3e"
              iconBg="#fdecea"
              label="Report a bug"
              isLast
              onPress={() => Linking.openURL("mailto:support@subradar.app?subject=Bug%20Report")}
            />
          </View>
        </View>

        {/* ── Legal ── */}
        <View className="mb-6">
          <Text className="mb-2 px-1 text-[11px] font-sans-semibold uppercase tracking-[1.5px] text-muted-foreground">
            Legal
          </Text>
          <View className="rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-card" style={shadowCard}>
            <Row
              icon="document-text-outline"
              iconColor="#9a6700"
              iconBg="#fef3cd"
              label="Terms of Service"
              isFirst
              onPress={() => Linking.openURL("https://subradar.app/terms")}
            />
            <Row
              icon="shield-outline"
              iconColor="#2f6fed"
              iconBg="#eef3fd"
              label="Privacy Policy"
              isLast
              onPress={() => Linking.openURL("https://subradar.app/privacy")}
            />
          </View>
        </View>

        {/* ── Sign Out ── */}
        <Pressable
          className={`mb-6 flex-row items-center gap-3.5 rounded-2xl border border-border bg-white dark:border-[#3a3a3a] dark:bg-card px-4 py-3.5 ${isSigningOut ? "opacity-50" : ""}`}
          style={shadowCard}
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          <View className="size-8 items-center justify-center rounded-full bg-[#fdecea]">
            <Ionicons name="log-out-outline" size={16} color="#e03e3e" />
          </View>
          <Text className="text-[15px] font-sans-medium text-destructive">
            {isSigningOut ? "Signing out\u2026" : "Sign out"}
          </Text>
        </Pressable>

        {/* ── Credit & Version ── */}
        <Text className="text-center text-[12px] font-sans-medium text-muted-foreground">
          SubRadar v1.0.0 | Mubashshir Khan
        </Text>
      </ScrollView>

      {/* ── Modals ── */}
      <EditProfileSheet
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
      <ChangePasswordSheet
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      <ChangeEmailSheet
        visible={showChangeEmail}
        onClose={() => setShowChangeEmail(false)}
      />
      <CurrencyPickerSheet
        visible={showCurrencyPicker}
        onClose={() => setShowCurrencyPicker(false)}
        selected={currency}
        onSelect={(code) => updateSettings({ currency: code })}
      />
      <ThemePickerSheet
        visible={showThemePicker}
        onClose={() => setShowThemePicker(false)}
        selected={themeMode}
        onSelect={(mode) => updateSettings({ themeMode: mode })}
      />

      <ConfirmDialog
        visible={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={confirmSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out? You will need to sign in again to access your account."
        confirmLabel="Sign Out"
        loading={isSigningOut}
      />
    </SafeAreaView>
    </ErrorBoundary>
  );
};

export default Settings;
