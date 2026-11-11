import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { useSupportConfig } from "@/hooks/useSupportConfig";

interface SupportContactModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Muestra los canales oficiales de soporte y horarios configurados por administración.
 */
export const SupportContactModal: React.FC<SupportContactModalProps> = ({
  visible,
  onClose,
}) => {
  const { supportConfig, isLoading, refreshSupport } = useSupportConfig(false);

  useEffect(() => {
    if (visible) {
      refreshSupport();
    }
  }, [visible, refreshSupport]);

  const openWhatsapp = () => {
    const clean = supportConfig.whatsapp.replace(/\D/g, "");
    const text = encodeURIComponent(supportConfig.whatsappMessage);
    Linking.openURL(`https://wa.me/${clean}?text=${text}`);
  };

  const openPhone = () => {
    const clean = supportConfig.phone.replace(/[^\d+]/g, "");
    Linking.openURL(`tel:${clean}`);
  };

  const openEmail = () => {
    Linking.openURL(`mailto:${supportConfig.email}`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Soporte y Asistencia</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color={Palette.primaryDark} style={{ marginVertical: 20 }} />
          ) : null}

          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={[styles.channelBtn, styles.waBtn]} onPress={openWhatsapp}>
              <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
              <Text style={styles.waBtnText}>WhatsApp ({supportConfig.whatsapp})</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.channelBtn} onPress={openPhone}>
              <Ionicons name="call-outline" size={20} color={Palette.primaryDark} />
              <Text style={styles.channelText}>Llamar: {supportConfig.phone}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.channelBtn} onPress={openEmail}>
              <Ionicons name="mail-outline" size={20} color={Palette.primaryDark} />
              <Text style={styles.channelText}>{supportConfig.email}</Text>
            </TouchableOpacity>

            <View style={styles.scheduleBox}>
              <Text style={styles.scheduleTitle}>Horarios de Atención</Text>
              <Text style={styles.scheduleLine}>Lun - Vie: {supportConfig.scheduleWeekday}</Text>
              <Text style={styles.scheduleLine}>Sábados: {supportConfig.scheduleSaturday}</Text>
              <Text style={styles.scheduleLine}>Domingos / Feriados: {supportConfig.scheduleSunday}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
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
    maxHeight: "82%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: "700", color: Palette.primaryDark },
  channelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    marginBottom: 10,
  },
  waBtn: { backgroundColor: "#16A34A" },
  waBtnText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  channelText: { fontSize: 14, fontWeight: "600", color: Palette.primaryDark, flexShrink: 1 },
  scheduleBox: {
    marginTop: 6,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  scheduleTitle: { fontSize: 13, fontWeight: "700", color: Palette.primaryDark, marginBottom: 6 },
  scheduleLine: { fontSize: 13, color: "#475569", marginTop: 2 },
  closeBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
  },
  closeBtnText: { fontSize: 14, fontWeight: "600", color: "#334155" },
});
