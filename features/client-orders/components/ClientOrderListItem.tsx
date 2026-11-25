import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InfoRow } from "@/components/InfoRow";
import { StatusBadge } from "@/components/StatusBadge";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { Palette } from "@/constants/theme";

interface ClientOrderListItemProps {
  order: any;
  onPress: () => void;
  onQuickReorder: (order: any) => void;
}

export const ClientOrderListItem: React.FC<ClientOrderListItemProps> = ({
  order,
  onPress,
  onQuickReorder,
}) => {
  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.orderNumber}>
          {ORDER_PREFIX.ORD}
          {String(order.orderNumber ?? "N/A")}
        </Text>

        {Boolean(order.isAssisted || order.createdByRole || order.createdBySellerId || order.createdByAdminId) && (
          <View style={styles.assistedBadge}>
            <Ionicons name="sparkles" size={12} color="#4338CA" />
            <Text style={styles.assistedBadgeText} numberOfLines={1}>
              Venta Asistida • {order.createdByName || (order.createdByRole === "seller" ? "Vendedor" : "Admin")}
            </Text>
          </View>
        )}

        <InfoRow
          icon="cube-outline"
          label="Productos"
          value={order.items?.length || 0}
        />
        <InfoRow
          icon="calendar-outline"
          label="Fecha"
          value={new Date(order.createdAt).toLocaleDateString()}
        />
        <InfoRow icon="shield-checkmark-outline" label="Estado">
          <StatusBadge status={order.status} size="small" />
        </InfoRow>

        {order.status === "rejected" && Boolean(order.rejectionReason || order.declineReason) && (
          <View style={styles.rejectionCard}>
            <Text style={styles.rejectionText}>
              Motivo: {order.rejectionReason || order.declineReason}
            </Text>
          </View>
        )}

        {order.status === "delivered" && (
          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.quickReorderBtn}
              onPress={() => onQuickReorder(order)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="repeat"
                size={14}
                color={Palette.primary}
                style={styles.repeatIcon}
              />
              <Text style={styles.quickReorderText}>Volver a pedir</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.textDark,
    marginBottom: 8,
  },
  assistedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginBottom: 10,
  },
  assistedBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3730A3",
  },
  rejectionCard: {
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  rejectionText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
  cardFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "flex-end",
  },
  quickReorderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  repeatIcon: {
    marginRight: 4,
  },
  quickReorderText: {
    color: Palette.primary,
    fontSize: 12,
    fontWeight: "700",
  },
});
