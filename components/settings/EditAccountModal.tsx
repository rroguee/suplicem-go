import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { useEditAccountForm } from "@/hooks/useEditAccountForm";
import { UpdateOwnProfilePayload } from "@/services/userService";

interface EditAccountModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    uid?: string;
    names?: string;
    lastNames?: string;
    phone?: string;
    email?: string;
    identification?: string;
    identificationType?: string;
  } | null;
  onSuccess: (updated: UpdateOwnProfilePayload) => void;
}

/**
 * Modal reutilizable para editar nombres, apellidos y teléfono de la cuenta activa.
 */
export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  visible,
  onClose,
  user,
  onSuccess,
}) => {
  const { names, setNames, lastNames, setLastNames, phone, setPhone, handleSave } =
    useEditAccountForm({ visible, user, onSuccess, onClose });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Editar Mi Cuenta</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nombres *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Juan"
              placeholderTextColor={Palette.placeholder}
              value={names}
              onChangeText={setNames}
            />

            <Text style={styles.label}>Apellidos</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Pérez"
              placeholderTextColor={Palette.placeholder}
              value={lastNames}
              onChangeText={setLastNames}
            />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 8095550199"
              placeholderTextColor={Palette.placeholder}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <View style={styles.readOnlyBox}>
              <Text style={styles.readOnlyLabel}>Correo (no editable)</Text>
              <Text style={styles.readOnlyValue}>{user?.email || "No registrado"}</Text>
              <Text style={[styles.readOnlyLabel, { marginTop: 8 }]}>
                {user?.identificationType || "Documento"} (no editable)
              </Text>
              <Text style={styles.readOnlyValue}>
                {user?.identification || "No especificado"}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15, 41, 74, 0.45)", justifyContent: "flex-end" },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "88%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: "700", color: Palette.primaryDark },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Palette.primaryDark,
    backgroundColor: "#F8FAFC",
  },
  readOnlyBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  readOnlyLabel: { fontSize: 11, fontWeight: "600", color: "#64748B" },
  readOnlyValue: { fontSize: 13, fontWeight: "600", color: "#334155", marginTop: 2 },
  actions: { flexDirection: "row", gap: 10, marginTop: 20, marginBottom: 8 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Palette.primaryDark,
    alignItems: "center",
  },
  saveBtnText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});
