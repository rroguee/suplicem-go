import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "@/types/orders";
import { StatusBadge } from "@/components/StatusBadge";
import { formatProductQuantity } from "@/constants/cartConstants";
import { Palette } from "@/constants/theme";

interface OrderCardProps {
  order: Order;
  onPressDetails: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPressDetails }) => {
  const isCredit = order.paymentMethod === "credit";
  const clientName = `${order.userNames || ""} ${order.userLastNames || ""}`.trim() || "Cliente no especificado";
  const aiRisk = (order as any).aiRiskFlag;

  return (
    <View style={[styles.card, aiRisk && styles.cardAiRisk]}>
      {/* Alerta de Seguridad IA si aplica */}
      {aiRisk && (
        <View style={styles.aiAlertBanner}>
          <Ionicons name="warning-outline" size={16} color="#991B1B" />
          <Text style={styles.aiAlertText}>
            Alerta de Seguridad: Contenido posiblemente alterado con IA
          </Text>
        </View>
      )}

      {/* Header: Número de orden y badge de estado */}
      <View style={styles.headerRow}>
        <View style={styles.orderNumberContainer}>
          <Ionicons name="receipt-outline" size={18} color={Palette.primary} />
          <Text style={styles.orderNumberText}>
            Orden #{order.orderNumber || (order.id ? order.id.slice(0, 6) : "N/A")}
          </Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      {/* Datos del Cliente */}
      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={15} color="#64748B" />
        <Text style={styles.clientNameText} numberOfLines={1}>
          {clientName}
        </Text>
      </View>

      {order.userPhone ? (
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={15} color="#64748B" />
          <Text style={styles.clientSubText}>{order.userPhone}</Text>
        </View>
      ) : null}

      {/* Resumen de Productos */}
      <View style={styles.productSummaryBox}>
        <Ionicons name="cube-outline" size={16} color={Palette.primary} />
        <Text style={styles.productSummaryText}>
          {order.items && order.items.length > 0
            ? order.items.map((it) => formatProductQuantity(it.quantity, it.unit, it.name)).join(", ")
            : `${order.totalTons?.toFixed(2) || 0} t`}
        </Text>
      </View>

      {/* Método de Pago y Tipo de Entrega */}
      <View style={styles.metaRow}>
        <View style={[styles.paymentBadge, isCredit ? styles.creditBadge : styles.transferBadge]}>
          <Ionicons
            name={isCredit ? "hand-left-outline" : "card-outline"}
            size={13}
            color={isCredit ? "#78350F" : "#1E3A8A"}
          />
          <Text style={[styles.paymentText, isCredit ? styles.creditText : styles.transferText]}>
            {isCredit ? "Crédito" : "Transferencia"}
          </Text>
        </View>

        <Text style={styles.deliveryTypeText}>
          {order.deliveryType === "domicilio" ? "🚚 A Domicilio" : "🏬 En Almacén"}
        </Text>
      </View>

      {/* Motivo de rechazo */}
      {order.status === "rejected" && Boolean(order.rejectionReason || (order as any).declineReason) && (
        <View style={styles.rejectionBox}>
          <Text style={styles.rejectionText}>
            Motivo: {order.rejectionReason || (order as any).declineReason}
          </Text>
        </View>
      )}

      {/* Botón de Acción */}
      <TouchableOpacity
        style={styles.detailsBtn}
        onPress={() => onPressDetails(order.id || "")}
        activeOpacity={0.7}
      >
        <Text style={styles.detailsBtnText}>Ver Detalle de Orden</Text>
        <Ionicons name="chevron-forward" size={16} color={Palette.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardAiRisk: {
    borderColor: "#FCA5A5",
    borderWidth: 1.5,
  },
  aiAlertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  aiAlertText: {
    fontSize: 12,
    color: "#991B1B",
    fontWeight: "600",
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 8,
  },
  orderNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderNumberText: {
    fontSize: 15,
    fontWeight: "bold",
    color: Palette.primary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  clientNameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
  clientSubText: {
    fontSize: 13,
    color: "#64748B",
  },
  productSummaryBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  productSummaryText: {
    fontSize: 13,
    fontWeight: "500",
    color: Palette.primary,
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 10,
  },
  paymentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  transferBadge: {
    backgroundColor: "#DBEAFE",
  },
  creditBadge: {
    backgroundColor: "#FEF3C7",
  },
  paymentText: {
    fontSize: 12,
    fontWeight: "600",
  },
  transferText: {
    color: "#1E3A8A",
  },
  creditText: {
    color: "#78350F",
  },
  deliveryTypeText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  rejectionBox: {
    backgroundColor: "#FEF2F2",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  rejectionText: {
    fontSize: 12,
    color: "#B91C1C",
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    gap: 4,
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.primary,
  },
});
