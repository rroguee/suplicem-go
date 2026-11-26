import React from "react";
import { View, Text, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "@/types/orders";
import { useAuth } from "@/context/authContext";

interface ClientAssistedOrderCardProps {
  order: Order;
}

export const ClientAssistedOrderCard: React.FC<ClientAssistedOrderCardProps> = ({ order }) => {
  const { user } = useAuth();

  const isAssisted = Boolean(
    order.isAssisted || order.createdByRole || (order as any).createdBySellerId || (order as any).createdByAdminId
  );

  if (!isAssisted) return null;

  // Si el usuario actual es un vendedor y él mismo creó o tiene asignada la orden,
  // ocultamos el aviso (solo se muestra cuando el pedido fue asistido por otro vendedor/administración, o si lo ve el cliente).
  const isSellerUser = user?.userType === "seller";
  const userFullName = `${user?.names || ""} ${user?.lastNames || ""}`.trim().toLowerCase();
  const cleanUserPhone = (user?.phone || "").replace(/\D/g, "");
  const cleanOrderPhone = (order.createdByPhone || "").replace(/\D/g, "");

  const isSelf = Boolean(
    (user?.uid && (order as any).createdBySellerId && user.uid === (order as any).createdBySellerId) ||
    (user?.uid && order.sellerId && user.uid === order.sellerId) ||
    (cleanUserPhone && cleanOrderPhone && cleanUserPhone === cleanOrderPhone) ||
    (userFullName && order.createdByName && userFullName === order.createdByName.trim().toLowerCase())
  );

  if (isSellerUser && isSelf) {
    return null;
  }

  const isSeller = order.createdByRole === "seller" || Boolean((order as any).createdBySellerId);
  const roleLabel = isSeller ? "Vendedor Asignado" : "Administración";
  const creatorName = order.createdByName || (isSeller ? "Asesor Comercial" : "Administración");
  const phone = order.createdByPhone;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={12} color="#4338CA" />
          <Text style={styles.badgeText}>Orden Asistida</Text>
        </View>
        <Text style={styles.roleText}>{roleLabel}</Text>
      </View>

      <Text style={styles.title}>Registrada por {creatorName}</Text>
      <Text style={styles.description}>
        {isSellerUser
          ? "Este pedido fue ingresado por otro asesor comercial o por administración. Puedes comunicarte directamente si requieres coordinar antes del despacho."
          : "Este pedido fue ingresado por tu asesor comercial para agilizar tu compra. Puedes comunicarte directamente si requieres cualquier ajuste antes del despacho."}
      </Text>

      {Boolean(phone) && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${phone}`)}
            activeOpacity={0.7}
          >
            <Ionicons name="call-outline" size={13} color="#4338CA" />
            <Text style={styles.callBtnText}>Llamar al Asesor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.waBtn}
            onPress={() => {
              const raw = (phone || "").replace(/\D/g, "");
              const p = raw.length === 10 ? `1${raw}` : raw;
              Linking.openURL(`whatsapp://send?phone=${p}`);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-whatsapp" size={13} color="#166534" />
            <Text style={styles.waBtnText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F8FAFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E7FF",
    padding: 14,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
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
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4338CA",
  },
  waBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  waBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
  },
});
