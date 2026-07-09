import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "@/lib/useThemeSync";
import { shadowSheet } from "@/constants/shadows";

type InfoType = "help" | "terms" | "privacy";

type ProfessionalInfoSheetProps = {
  visible: boolean;
  onClose: () => void;
  type: InfoType;
};

const helpContent = [
  {
    title: "Getting Started",
    items: [
      "SubRadar helps you track and manage your subscriptions in one place.",
      "Add subscriptions manually or search from our database of popular services.",
      "Set up billing alerts to never miss a payment.",
    ],
  },
  {
    title: "Managing Subscriptions",
    items: [
      "Tap any subscription to view details or edit.",
      "Swipe left to delete a subscription.",
      "Use the More details section to add plan name, payment method, and custom renewal dates.",
    ],
  },
  {
    title: "Billing Alerts",
    items: [
      "Enable billing alerts to get notified before renewal.",
      "Choose how many days before renewal you want to be alerted.",
      "Alerts help you avoid unexpected charges.",
    ],
  },
  {
    title: "Dark Mode",
    items: [
      "Go to Settings > Appearance > Theme to change the app's appearance.",
      "Choose from System, Light, or Dark mode.",
    ],
  },
  {
    title: "Data & Privacy",
    items: [
      "All your data is stored securely.",
      "We never share your information with third parties.",
      "You can export or delete your data anytime.",
    ],
  },
];

const termsContent = [
  {
    title: "Acceptance of Terms",
    items: [
      "By using SubRadar, you agree to these terms of service.",
      "If you do not agree to these terms, please do not use the app.",
    ],
  },
  {
    title: "Description of Service",
    items: [
      "SubRadar is a subscription management application.",
      "We provide tools to track, manage, and get alerts for your subscriptions.",
      "We reserve the right to modify or discontinue the service at any time.",
    ],
  },
  {
    title: "User Responsibilities",
    items: [
      "You are responsible for maintaining the confidentiality of your account.",
      "You agree to use the app only for lawful purposes.",
      "You must not attempt to gain unauthorized access to any part of the service.",
    ],
  },
  {
    title: "Subscription Data",
    items: [
      "All subscription data you provide is stored securely.",
      "You retain ownership of all data you submit to the service.",
      "We implement industry-standard security measures to protect your data.",
    ],
  },
  {
    title: "Limitation of Liability",
    items: [
      "SubRadar is provided \"as is\" without warranties of any kind.",
      "We are not responsible for any inaccuracies in subscription data.",
      "Users should verify all subscription information independently.",
    ],
  },
  {
    title: "Changes to Terms",
    items: [
      "We reserve the right to modify these terms at any time.",
      "Changes will be effective upon posting to the app.",
      "Continued use of the app after changes constitutes acceptance.",
    ],
  },
];

const privacyContent = [
  {
    title: "Information We Collect",
    items: [
      "Account information (name, email) when you sign up via Clerk.",
      "Subscription data you voluntarily add to the app.",
      "Usage data to improve our services.",
    ],
  },
  {
    title: "How We Use Your Information",
    items: [
      "To provide and maintain the SubRadar service.",
      "To notify you about subscription renewals and billing alerts.",
      "To improve and personalize your experience.",
    ],
  },
  {
    title: "Data Storage & Security",
    items: [
      "Your data is stored securely using industry-standard encryption.",
      "We use Clerk for authentication and secure data handling.",
      "All sensitive data is protected with appropriate security measures.",
    ],
  },
  {
    title: "Data Sharing",
    items: [
      "We never sell your personal information to third parties.",
      "We may share anonymized, aggregated data for analytics purposes.",
      "Service providers (like Clerk) are bound by confidentiality agreements.",
    ],
  },
  {
    title: "Your Rights",
    items: [
      "You can export all your subscription data at any time.",
      "You can request deletion of your account and all associated data.",
      "Contact us at mubashshirk786@gmail.com for any data-related requests.",
    ],
  },
  {
    title: "Children's Privacy",
    items: [
      "SubRadar is not intended for users under the age of 13.",
      "We do not knowingly collect information from children.",
    ],
  },
  {
    title: "Contact Us",
    items: [
      "For privacy-related questions, contact us at mubashshirk786@gmail.com.",
      "We aim to respond to all inquiries within 48 hours.",
    ],
  },
];

const contentMap: Record<InfoType, { title: string; sections: typeof helpContent }> = {
  help: { title: "Help Center", sections: helpContent },
  terms: { title: "Terms of Service", sections: termsContent },
  privacy: { title: "Privacy Policy", sections: privacyContent },
};

export default function ProfessionalInfoSheet({
  visible,
  onClose,
  type,
}: ProfessionalInfoSheetProps) {
  const { isDark } = useTheme();
  const { title, sections } = contentMap[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/50" onPress={onClose} />

        <View
          className="max-h-[85%] rounded-t-3xl bg-white dark:bg-[#252528] dark:border dark:border-white/10"
          style={shadowSheet}
        >
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-muted" />
          </View>

          <View className="flex-row items-center justify-between border-b border-border px-6 py-4">
            <Text className="text-[17px] font-sans-bold text-primary">
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              className="size-8 items-center justify-center rounded-full bg-muted"
            >
              <Ionicons name="close" size={16} color={isDark ? "#888" : "#666"} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View className="px-6 pt-6 gap-8">
              {sections.map((section, sectionIndex) => (
                <View key={sectionIndex}>
                  <Text className="text-[15px] font-sans-bold text-primary mb-3">
                    {section.title}
                  </Text>
                  <View className="gap-2">
                    {section.items.map((item, itemIndex) => (
                      <View key={itemIndex} className="flex-row gap-2">
                        <Text className="text-[14px] font-sans-medium text-muted-foreground leading-6">
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}