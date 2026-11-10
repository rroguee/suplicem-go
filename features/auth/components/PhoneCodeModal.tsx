import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PhoneCodeModalProps {
  visible: boolean;
  phone: string;
  code: string;
  onChangeCode: (value: string) => void;
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const PhoneCodeModal: React.FC<PhoneCodeModalProps> = ({
  visible,
  phone,
  code,
  onChangeCode,
  isSubmitting,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Verificar teléfono</Text>
            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Ingresa el código de 6 dígitos enviado a {phone} para completar tu registro.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={onChangeCode}
            editable={!isSubmitting}
          />

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.disabled]}
            onPress={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Confirmar registro</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    color: "#0F294A",
    marginBottom: 12,
    textAlign: "center",
    fontSize: 22,
    letterSpacing: 6,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#E31E24",
    borderRadius: 8,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  disabled: {
    opacity: 0.6,
  },
});
