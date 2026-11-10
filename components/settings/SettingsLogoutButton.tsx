import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface SettingsLogoutButtonProps {
  onPress: () => void;
  label?: string;
}

export const SettingsLogoutButton: React.FC<SettingsLogoutButtonProps> = ({
  onPress,
  label = "Cerrar Sesión",
}) => {
  return (
    <TouchableOpacity style={styles.logoutBtn} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name="log-out-outline" size={20} color="#DC2626" />
      <Text style={styles.logoutText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginTop: 10,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#DC2626",
  },
});
