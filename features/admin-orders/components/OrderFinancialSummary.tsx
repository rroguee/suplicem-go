import { OrderItem } from "@/types/orders";
import { formatRD } from "@/utils/currencyUtils";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatProductQuantity } from "@/constants/cartConstants";

interface OrderFinancialSummaryProps {
  items: OrderItem[];
  comments?: string;
  paymentMethod?: "transfer" | "credit" | string;
  creditNote?: string;
  bankReferenceNumber?: string;
}

export const OrderFinancialSummary: React.FC<OrderFinancialSummaryProps> = ({
  items,
  comments,
  paymentMethod,
  creditNote,
  bankReferenceNumber,
}) => {
  const totalItemsCount = (items || []).reduce(
    (acc, item) => acc + (Number(item.quantity) || 0),
    0,
  );

  const isCredit = paymentMethod === "credit" || Boolean(creditNote);
  const paymentMethodLabel = isCredit
    ? "Pago a Crédito"
    : paymentMethod === "transfer" || comments?.includes("Transferencia")
      ? "Transferencia Bancaria"
      : "Pago a Crédito";

  const totalAmount = (items || []).reduce(
    (sum, item) =>
      sum +
      (Number(item.subtotal) ||
        Number(item.unitPrice || 0) * Number(item.quantity || 0)),
    0,
  );

  return (
    <View style={styles.orderSummaryCard}>
      {/* Encabezado */}
      <View style={styles.orderSummaryHeader}>
        <Ionicons name="receipt-outline" size={20} color="#0F294A" />
        <Text style={styles.orderSummaryTitle}>Resumen General de la Orden</Text>
      </View>

      {/* Lista de productos integrados */}
      <View style={styles.productsContainer}>
        {(items || []).map((item, index) => (
          <View
            key={item.productId || `item-${index}`}
            style={styles.productRow}
          >
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productQuantity}>
              Cantidad: {formatProductQuantity(item.quantity, item.unit, item.name)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Totales y Método de Pago */}
      <View style={styles.orderSummaryRow}>
        <Text style={styles.orderSummaryLabel}>Total Artículos:</Text>
        <Text style={styles.orderSummaryValue}>{totalItemsCount} ítems</Text>
      </View>

      <View style={styles.orderSummaryRow}>
        <Text style={styles.orderSummaryLabel}>Método de Pago:</Text>
        <Text style={styles.orderSummaryValueBold}>{paymentMethodLabel}</Text>
      </View>

      {Boolean(bankReferenceNumber) && (
        <View style={styles.orderSummaryRow}>
          <Text style={styles.orderSummaryLabel}>No. de Comprobante:</Text>
          <Text style={[styles.orderSummaryValueBold, { color: "#0F294A" }]}>
            {bankReferenceNumber}
          </Text>
        </View>
      )}

      {/* Solicitud de Pago a Crédito si aplica */}
      {isCredit && (
        <View style={styles.creditNoteContainer}>
          <View style={styles.creditNoteHeader}>
            <Ionicons name="document-text-outline" size={16} color="#A04A0E" />
            <Text style={styles.creditNoteTitle}>
              Solicitud de Pago a Crédito:
            </Text>
          </View>
          <Text style={styles.creditNoteText}>
            {creditNote && creditNote.trim()
              ? creditNote
              : "Sin observación adicional"}
          </Text>
        </View>
      )}

      {/* Comentarios adicionales */}
      {Boolean(comments && comments.trim()) && (
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsLabel}>Comentarios adicionales:</Text>
          <Text style={styles.commentsText}>{comments}</Text>
        </View>
      )}

      {/* Total General - Inset Surface Card */}
      <View style={styles.totalContainer}>
        <View style={styles.totalLabelWrapper}>
          <Text style={styles.totalLabel}>TOTAL GENERAL</Text>
          <Text style={styles.totalSubLabel}>Monto total de la orden</Text>
        </View>
        <Text
          style={styles.totalAmountText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {formatRD(totalAmount)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  orderSummaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  orderSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  productsContainer: {
    marginBottom: 4,
  },
  productRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "center",
  },
  productQuantity: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F294A",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 10,
  },
  orderSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderSummaryLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  orderSummaryValue: {
    fontSize: 14,
    color: "#1E293B",
  },
  orderSummaryValueBold: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F294A",
  },
  totalContainer: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabelWrapper: {
    flex: 1,
    marginRight: 8,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.6,
  },
  totalSubLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
    fontWeight: "500",
  },
  totalAmountText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F294A",
    textAlign: "right",
  },
  creditNoteContainer: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  creditNoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  creditNoteTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A04A0E",
  },
  creditNoteText: {
    fontSize: 14,
    color: "#78350F",
    fontStyle: "italic",
  },
  commentsContainer: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  commentsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 2,
  },
  commentsText: {
    fontSize: 13,
    color: "#334155",
  },
});
