import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DeliveryDetail, OrderItem } from "@/types/orders";
import { formatProductQuantity } from "@/constants/cartConstants";

interface DeliveryViewCardProps {
  delivery: DeliveryDetail;
  items: OrderItem[];
  index: number;
}

export const DeliveryViewCard: React.FC<DeliveryViewCardProps> = ({
  delivery,
  items,
  index,
}) => {
  const productName =
    items?.find((o) => o.productId === delivery.productId)?.name ||
    delivery.productId ||
    `Producto`;

  return (
    <View style={styles.deliveryCard}>
      <Text style={styles.deliveryHeader}>Punto de Entrega</Text>
      <Text style={styles.deliveryAddress}>
        📍 {delivery.address?.description || "Dirección no especificada"}
        {delivery.address?.additionalInfo ? `, ${delivery.address.additionalInfo}` : ""}
      </Text>
      {Boolean(delivery.address?.recipientName) && (
        <Text style={styles.deliveryRecipient}>
          👤 <Text style={styles.bold}>Entregar a:</Text> {delivery.address?.recipientName}
        </Text>
      )}
      <Text style={styles.productValue}>
        🪣 {productName} - {formatProductQuantity(delivery.quantity, delivery.unit, productName)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  deliveryHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#A04A0E",
    marginBottom: 6,
  },
  deliveryAddress: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 4,
  },
  deliveryRecipient: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 4,
  },
  productValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F294A",
    marginTop: 4,
  },
  bold: {
    fontWeight: "bold",
  },
});
