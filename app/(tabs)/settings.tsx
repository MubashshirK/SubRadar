import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import EditProfileSheet from "@/components/settings/EditProfileSheet";
import ChangePasswordSheet from "@/components/settings/ChangePasswordSheet";
import ChangeEmailSheet from "@/components/settings/ChangeEmailSheet";

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
  const borderClass = !isLast ? "border-b border-[#f0f0f0]" : "";
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
  const [showEditProfile, setShowEditProfile] = React.useState(false);
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [showChangeEmail, setShowChangeEmail] = React.useState(false);

  const displayName = user?.fullName || user?.firstName || "User";
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const avatarSource = user?.imageUrl
    ? { uri: user.imageUrl }
    : images.avatar;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8f8f8]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32 pt-6"
      >
        {/* ── Header ── */}
        <Text className="mb-6 text-[28px] font-sans-bold text-primary">
          Settings
        </Text>

        {/* ── Profile Card ── */}
        <Pressable className="mb-8 flex-row items-center gap-4 rounded-2xl bg-white px-5 py-5">
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
          <View className="rounded-2xl bg-white">
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
          <View className="rounded-2xl bg-white">
            <Row
              icon="card-outline"
              iconColor="#e03e3e"
              iconBg="#fdecea"
              label="Billing alerts"
              description="Get notified before renewals"
              isFirst
            />
            <Row
              icon="notifications-outline"
              iconColor="#ea7a53"
              iconBg="#fdf0ea"
              label="Renewal reminders"
              description="Remind me before a subscription renews"
            />
            <Row
              icon="globe-outline"
              iconColor="#2f6fed"
              iconBg="#eef3fd"
              label="Default currency"
              rightElement={
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[13px] font-sans-medium text-muted-foreground">
                    USD
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </View>
              }
            />
            <Row
              icon="pricetag-outline"
              iconColor="#7c3aed"
              iconBg="#f3eefb"
              label="Categories"
              description="Manage your categories"
              isLast
            />
          </View>
        </View>

        {/* ── Appearance ── */}
        <View className="mb-6">
          <Text className="mb-2 px-1 text-[11px] font-sans-semibold uppercase tracking-[1.5px] text-muted-foreground">
            Appearance
          </Text>
          <View className="rounded-2xl bg-white">
            <Row
              icon="moon-outline"
              iconColor="#191919"
              iconBg="#efefed"
              label="Dark mode"
              rightElement={
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[13px] font-sans-medium text-muted-foreground">
                    Off
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </View>
              }
              isFirst
              isLast
            />
          </View>
        </View>

        {/* ── Support ── */}
        <View className="mb-6">
          <Text className="mb-2 px-1 text-[11px] font-sans-semibold uppercase tracking-[1.5px] text-muted-foreground">
            Support
          </Text>
          <View className="rounded-2xl bg-white">
            <Row
              icon="help-circle-outline"
              iconColor="#2f6fed"
              iconBg="#eef3fd"
              label="Help center"
              description="FAQs and guides"
              isFirst
            />
            <Row
              icon="chatbubble-outline"
              iconColor="#0f7b6c"
              iconBg="#e6f5f0"
              label="Contact us"
              description="Send us a message"
            />
            <Row
              icon="bug-outline"
              iconColor="#e03e3e"
              iconBg="#fdecea"
              label="Report a bug"
              isLast
            />
          </View>
        </View>

        {/* ── Legal ── */}
        <View className="mb-6">
          <Text className="mb-2 px-1 text-[11px] font-sans-semibold uppercase tracking-[1.5px] text-muted-foreground">
            Legal
          </Text>
          <View className="rounded-2xl bg-white">
            <Row
              icon="document-text-outline"
              iconColor="#9a6700"
              iconBg="#fef3cd"
              label="Terms of Service"
              isFirst
            />
            <Row
              icon="shield-outline"
              iconColor="#2f6fed"
              iconBg="#eef3fd"
              label="Privacy Policy"
              isLast
            />
          </View>
        </View>

        {/* ── Sign Out ── */}
        <Pressable
          className={`mb-6 flex-row items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5 ${isSigningOut ? "opacity-50" : ""}`}
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

        {/* ── Version ── */}
        <Text className="text-center text-[12px] font-sans-medium text-muted-foreground">
          SubRadar v1.0.0
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
    </SafeAreaView>
  );
};

export default Settings;
