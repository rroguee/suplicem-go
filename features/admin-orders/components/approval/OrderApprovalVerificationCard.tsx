import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "@/types/orders";
import { AssistedOrderBanner } from "../AssistedOrderBanner";

interface Props {
  order: Order;
  onViewReceipt?: () => void;
}

export const OrderApprovalVerificationCard: React.FC<Props> = ({
  order,
  onViewReceipt,
}) => {
  const hasReceipt = Boolean(order.receiptImage);
  const rawName = `${order.userNames || ""} ${order.userLastNames || ""}`.trim() || "Cliente no especificado";
  const clientName =
    rawName === rawName.toUpperCase() && rawName.length > 3
      ? rawName.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())
      : rawName;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerInfo}>
          <Text style={styles.orderNumber}>Orden #{order.orderNumber}</Text>
          <View style={styles.clientRow}>
            <Ionicons name="person-outline" size={14} color="#64748B" />
            <Text style={styles.clientName}>{clientName}</Text>
          </View>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {order.deliveryType === "almacen" ? "Retiro Almacén" : "Entrega a Domicilio"}
          </Text>
        </View>
      </View>

      <View style={styles.contactContainer}>
        {Boolean(order.userPhone) && (
          <View style={styles.metaRow}>
            <Ionicons name="call-outline" size={13} color="#64748B" />
            <Text style={styles.metaText}>{order.userPhone}</Text>
          </View>
        )}
        {Boolean(order.userEmail) && (
          <View style={styles.metaRow}>
            <Ionicons name="mail-outline" size={13} color="#64748B" />
            <Text style={styles.metaText}>{order.userEmail}</Text>
          </View>
        )}
      </View>

      <AssistedOrderBanner order={order} compact />

      <View style={styles.divider} />

      <View style={styles.paymentRow}>
        <View>
          <Text style={styles.sectionLabel}>Método de Pago</Text>
          <Text style={styles.paymentValue}>
            {order.paymentMethod === "credit" ? "Pago a Crédito" : "Transferencia Bancaria"}
          </Text>
          {Boolean(order.bankReferenceNumber) && (
            <Text style={styles.bankRefText}>
              Ref. Bancaria: {order.bankReferenceNumber}
            </Text>
          )}
        </View>

        {hasReceipt && onViewReceipt && (
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
          <View style={styles.commentsHeader}>
            <Ionicons name="chatbox-ellipses-outline" size={14} color="#475569" />
            <Text style={styles.commentsLabel}>Instrucciones del Cliente:</Text>
          </View>
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
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  clientName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
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
  contactContainer: {
    marginTop: 6,
    gap: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#64748B",
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
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F294A",
    marginTop: 2,
  },
  bankRefText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0284C7",
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
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  commentsLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  commentsText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
    fontStyle: "italic",
  },
});