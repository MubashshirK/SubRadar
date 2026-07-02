import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Sheet from "./Sheet";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function EditProfileSheet({ visible, onClose }: Props) {
  const { user } = useUser();
  const [firstName, setFirstName] = React.useState(user?.firstName || "");
  const [lastName, setLastName] = React.useState(user?.lastName || "");
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [imageBase64, setImageBase64] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Reset fields when sheet opens
  React.useEffect(() => {
    if (visible) {
      setFirstName(user?.firstName || "");
      setLastName(user?.lastName || "");
      setImageUri(null);
      setImageBase64(null);
      setError("");
    }
  }, [visible, user?.firstName, user?.lastName]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      const asset = result.assets[0];
      if (asset.base64 && asset.mimeType) {
        setImageBase64(`data:${asset.mimeType};base64,${asset.base64}`);
      }
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await user?.update({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
      });

      if (imageBase64) {
        await user?.setProfileImage({ file: imageBase64 });
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const avatarSource = imageUri
    ? { uri: imageUri }
    : user?.imageUrl
      ? { uri: user.imageUrl }
      : null;

  return (
    <Sheet visible={visible} onClose={onClose} title="Edit profile">
      {/* Avatar */}
      <View className="items-center mb-6">
        <Pressable onPress={pickImage}>
          {avatarSource ? (
            <Image source={avatarSource} className="size-20 rounded-full" />
          ) : (
            <View className="size-20 items-center justify-center rounded-full bg-[#f0f0f0]">
              <Ionicons name="person-outline" size={32} color="#999" />
            </View>
          )}
          <View className="absolute -bottom-1 -right-1 size-7 items-center justify-center rounded-full bg-primary">
            <Ionicons name="camera" size={13} color="white" />
          </View>
        </Pressable>
        <Pressable onPress={pickImage} className="mt-2">
          <Text className="text-[13px] font-sans-semibold text-primary">
            Change photo
          </Text>
        </Pressable>
      </View>

      {/* First name */}
      <View className="mb-4">
        <Text className="mb-2 text-[13px] font-sans-semibold text-primary">
          First name
        </Text>
        <TextInput
          className="rounded-xl border border-[#e5e5e5] bg-white pl-4 pr-11 py-3.5 text-[15px] font-sans-medium text-primary"
          placeholderTextColor="rgba(55, 53, 47, 0.35)"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
        />
      </View>

      {/* Last name */}
      <View className="mb-4">
        <Text className="mb-2 text-[13px] font-sans-semibold text-primary">
          Last name
        </Text>
        <TextInput
          className="rounded-xl border border-[#e5e5e5] bg-white pl-4 pr-11 py-3.5 text-[15px] font-sans-medium text-primary"
          placeholderTextColor="rgba(55, 53, 47, 0.35)"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name (optional)"
        />
      </View>

      {/* Error */}
      {error ? (
        <View className="mb-4 flex-row items-center gap-2">
          <View className="size-1.5 rounded-full bg-destructive" />
          <Text className="text-[12px] font-sans-medium text-destructive">
            {error}
          </Text>
        </View>
      ) : null}

      {/* Save button */}
      <Pressable
        className={`mt-2 items-center rounded-full bg-primary py-4 ${loading ? "opacity-60" : ""}`}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text className="text-[15px] font-sans-bold text-white">
            Save changes
          </Text>
        )}
      </Pressable>
    </Sheet>
  );
}
