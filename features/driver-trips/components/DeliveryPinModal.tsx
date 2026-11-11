import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface DeliveryPinModalProps {
  visible: boolean;
  tripNumber?: string;
  onConfirm: (pin: string) => void;
  onClose: () => void;
  adminPhone?: string;
  supportWhatsapp?: string;
  supportPhone?: string;
}

export const DeliveryPinModal: React.FC<DeliveryPinModalProps> = ({
  visible,
  tripNumber,
  onConfirm,
  onClose,
  adminPhone = "18095550199",
  supportWhatsapp,
  supportPhone,
}) => {
  const [pin, setPin] = useState("");

  const handleConfirm = () => {
    if (pin.trim().length !== 4) {
      Alert.alert("Código requerido", "Por favor ingresa el código de 4 dígitos proporcionado por el cliente.");
      return;
    }
    onConfirm(pin.trim());
    setPin("");
  };

  const handleContactAdmin = (channel: "whatsapp" | "call") => {
    const rawTarget =
      channel === "call"
        ? supportPhone || adminPhone
        : supportWhatsapp || adminPhone;
    const cleanPhone = rawTarget.replace(/[^\d+]/g, "");
    if (channel === "call") {
      Linking.openURL(`tel:${cleanPhone}`);
    } else {
      const message = encodeURIComponent(
        `Hola Administrador, soy conductor de Suplicem. Estoy en la entrega del viaje #${tripNumber || "N/A"}. El cliente no dispone de su código de entrega. Por favor confirmar y completar el viaje desde el panel.`
      );
      Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${message}`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Ionicons name="key-outline" size={28} color={Palette.primary} />
            <Text style={styles.title}>Confirmar Entrega</Text>
          </View>

          <Text style={styles.subtitle}>
            Solicita al cliente el código PIN de 4 dígitos que aparece en su aplicación para finalizar el viaje:
          </Text>

          <TextInput
            style={styles.pinInput}
            value={pin}
            onChangeText={(text) => setPin(text.replace(/[^0-9]/g, "").slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="0000"
            placeholderTextColor="#94A3B8"
            autoFocus
          />

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnConfirm]} onPress={handleConfirm}>
              <Text style={styles.btnConfirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          {/* Sección de Contingencia si el cliente no tiene batería / internet */}
          <View style={styles.contingencyBox}>
            <Text style={styles.contingencyTitle}>¿El cliente no tiene su código?</Text>
            <Text style={styles.contingencyDesc}>
              Si el cliente no tiene el código de confirmación, contacta a un miembro del equipo para que pueda confirmar la entrega directamente. Puedes contactarlos vía WhatsApp o llamada:
            </Text>
            <View style={styles.contingencyActions}>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => handleContactAdmin("whatsapp")}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#16A34A" />
                <Text style={styles.contactBtnText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => handleContactAdmin("call")}
              >
                <Ionicons name="call-outline" size={16} color="#0F294A" />
                <Text style={styles.contactBtnText}>Llamar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  card: { backgroundColor: "#fff", width: "100%", borderRadius: 16, padding: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "bold", color: Palette.textDark },
  subtitle: { fontSize: 14, color: Palette.textMuted, marginBottom: 16 },
  pinInput: {
    borderWidth: 2,
    borderColor: Palette.primary,
    borderRadius: 12,
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 12,
    paddingVertical: 12,
    color: Palette.textDark,
    marginBottom: 20,
    backgroundColor: "#F8FAFC",
  },
  actions: { flexDirection: "row", gap: 12, justifyContent: "flex-end" },
  btn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, minWidth: 100, alignItems: "center" },
  btnCancel: { backgroundColor: "#F1F5F9" },
  btnCancelText: { color: "#475569", fontWeight: "600" },
  btnConfirm: { backgroundColor: Palette.primary },
  btnConfirmText: { color: "#fff", fontWeight: "bold" },
  contingencyBox: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  contingencyTitle: { fontSize: 13, fontWeight: "bold", color: "#64748B", marginBottom: 4 },
  contingencyDesc: { fontSize: 12, color: "#94A3B8", marginBottom: 10 },
  contingencyActions: { flexDirection: "row", gap: 10 },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  contactBtnText: { fontSize: 12, fontWeight: "600", color: "#334155" },
});
