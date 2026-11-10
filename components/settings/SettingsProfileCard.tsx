import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface SettingsProfileCardProps {
  name: string;
  email?: string;
  phone?: string;
  badgeText: string;
  badgeIcon?: keyof typeof Ionicons.glyphMap;
  badgeColor?: string;
  badgeBgColor?: string;
  badgeBorderColor?: string;
  avatarIcon?: keyof typeof Ionicons.glyphMap;
}

export const SettingsProfileCard: React.FC<SettingsProfileCardProps> = ({
  name,
  email,
  phone,
  badgeText,
  badgeIcon = "person",
  badgeColor = "#0369A1",
  badgeBgColor = "#E0F2FE",
  badgeBorderColor = "#BAE6FD",
  avatarIcon = "person",
}) => {
  return (
    <View style={styles.profileCard}>
      <View style={styles.avatar}>
        <Ionicons name={avatarIcon} size={32} color="#0F294A" />
      </View>
      <Text style={styles.profileName}>{name}</Text>
      {email ? <Text style={styles.profileEmail}>{email}</Text> : null}
      {phone ? <Text style={styles.profilePhone}>{phone}</Text> : null}

      <View
        style={[
          styles.badgeContainer,
          { backgroundColor: badgeBgColor, borderColor: badgeBorderColor },
        ]}
      >
        <Ionicons name={badgeIcon} size={15} color={badgeColor} />
        <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
  },
  profileEmail: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  profilePhone: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 1,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
