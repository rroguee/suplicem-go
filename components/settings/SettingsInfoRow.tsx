import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export interface SettingsInfoRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isEditing?: boolean;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
}

export const SettingsInfoRow: React.FC<SettingsInfoRowProps> = ({
  label,
  value,
  icon,
  isEditing = false,
  onChangeText,
  placeholder,
  keyboardType = "default",
}) => {
  return (
    <View style={styles.row}>
      {icon ? <View style={styles.iconBox}>{icon}</View> : null}
      <View style={styles.textBox}>
        <Text style={styles.label}>{label}</Text>
        {isEditing && onChangeText ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            keyboardType={keyboardType}
          />
        ) : (
          <Text style={styles.value}>{value || "No especificado"}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textBox: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F294A",
  },
  input: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F294A",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
  },
});
