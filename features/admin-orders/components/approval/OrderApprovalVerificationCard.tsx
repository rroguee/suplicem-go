import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "@/types/orders";

interface Props {
  order: Order;
  onViewReceipt: () => void;
}

export const OrderApprovalVerificationCard: React.FC<Props> = ({
  order,
  onViewReceipt,
}) => {
  const hasReceipt = Boolean(order.receiptImage);
  const clientName = `${order.userNames || ""} ${order.userLastNames || ""}`.trim() || "Cliente no especificado";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerInfo}>
          <Text style={styles.orderNumber}>Orden #{order.orderNumber}</Text>
          <Text style={styles.clientName}>👤 {clientName}</Text>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {order.deliveryType === "almacen" ? "Retiro Almacén" : "Entrega a Domicilio"}
          </Text>
        </View>
      </View>

      {Boolean(order.userPhone) && (
        <Text style={styles.metaText}>📞 {order.userPhone}</Text>
      )}
      {Boolean(order.userEmail) && (
        <Text style={styles.metaText}>✉️ {order.userEmail}</Text>
      )}

      <View style={styles.divider} />

      <View style={styles.paymentRow}>
        <View>
          <Text style={styles.sectionLabel}>Método de Pago</Text>
          <Text style={styles.paymentValue}>
            {order.paymentMethod === "credit" ? "Pago a Crédito" : "Transferencia Bancaria"}
          </Text>
        </View>

        {hasReceipt && (
          <TouchableOpacity
            style={styles.receiptButton}
            onPress={onViewReceipt}
            activeOpacity={0.8}
          >
            <Ionicons name="receipt-outline" size={16} color="#0F294A" />
            <Text style={styles.receiptButtonText}>Ver Comprobante</Text>
          </TouchableOpacity>
        )}
      </View>

      {Boolean(order.comments) && (
        <View style={styles.commentsBox}>
          <Text style={styles.commentsLabel}>💬 Instrucciones / Comentarios del Cliente:</Text>
          <Text style={styles.commentsText}>{order.comments}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  headerInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
  },
  clientName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  metaText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F294A",
    marginTop: 2,
  },
  receiptButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  receiptButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  commentsBox: {
    marginTop: 12,
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  commentsLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 4,
  },
  commentsText: {
    fontSize: 14,
    color: "#78350F",
    lineHeight: 18,
  },
});