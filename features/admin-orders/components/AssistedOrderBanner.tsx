import React from "react";
import { View, Text, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "@/types/orders";
import { useAuth } from "@/context/authContext";
import { isAssistedOrder, isAssistedOrderCreator } from "@/utils/orderAssistedUtils";

interface AssistedOrderBannerProps {
  order: Order;
  compact?: boolean;
}

export const AssistedOrderBanner: React.FC<AssistedOrderBannerProps> = ({
  order,
  compact = false,
}) => {
  const { user } = useAuth();

  if (!isAssistedOrder(order)) {
    return null;
  }

  // Si el usuario actual (admin o vendedor) fue quien registró la orden asistida,
  // ocultamos el aviso (solo debe verse por otros administradores auditores).
  if (isAssistedOrderCreator(user, order)) {
    return null;
  }

  const isSeller = order.createdByRole === "seller" || Boolean((order as any).createdBySellerId);
  const roleLabel = isSeller ? "Vendedor" : "Administrador";
  const creatorName =
    order.createdByName || (isSeller ? "Vendedor Asignado" : "Administración");
  const phone = order.createdByPhone;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name="briefcase-outline" size={13} color="#4338CA" />
        <Text style={styles.compactText} numberOfLines={1}>
          Venta Asistida • {creatorName} ({roleLabel})
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Ionicons name="briefcase-outline" size={12} color="#3730A3" />
          <Text style={styles.badgeText}>Venta Asistida</Text>
        </View>
        <Text style={styles.roleText}>{roleLabel}</Text>
      </View>

      <View style={styles.creatorRow}>
        <Ionicons name="person-circle-outline" size={20} color="#4338CA" />
        <Text style={styles.creatorName}>{creatorName}</Text>
      </View>

      {Boolean(phone) && (
        <View style={styles.contactRow}>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => Linking.openURL(`tel:${phone}`)}
            activeOpacity={0.7}
          >
            <Ionicons name="call-outline" size={13} color="#4338CA" />
            <Text style={styles.contactBtnText}>Llamar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactBtn, styles.whatsappBtn]}
            onPress={() => {
              const raw = (phone || "").replace(/\D/g, "");
              const p = raw.length === 10 ? `1${raw}` : raw;
              Linking.openURL(`whatsapp://send?phone=${p}`);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-whatsapp" size={13} color="#166534" />
            <Text style={[styles.contactBtnText, styles.whatsappBtnText]}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3730A3",
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  contactRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  contactBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4338CA",
  },
  whatsappBtn: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  whatsappBtnText: {
    color: "#166534",
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    marginBottom: 10,
  },
  compactText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3730A3",
    flex: 1,
  },
});
