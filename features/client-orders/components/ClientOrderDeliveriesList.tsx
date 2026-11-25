import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { openExternalNavigation } from "@/utils/navigationUtils";
import { formatProductQuantity } from "@/constants/cartConstants";

interface ClientOrderDeliveriesListProps {
  deliveries?: any[];
  items?: any[];
}

export const ClientOrderDeliveriesList: React.FC<ClientOrderDeliveriesListProps> = ({
  deliveries = [],
  items = [],
}) => {
  if (!deliveries.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Entregas</Text>
      {deliveries.map((delivery: any, idx: number) => {
        const product = items.find((o: any) => o.productId === delivery.productId);
        return (
          <View key={idx} style={styles.deliveryCard}>
            <View style={styles.addressRow}>
              <Ionicons name="location" size={17} color="#DC2626" style={{ marginTop: 2 }} />
              <Text style={styles.deliveryAddress}>
                {delivery.address?.description}
                {delivery.address?.additionalInfo ? `, ${delivery.address.additionalInfo}` : ""}
              </Text>
            </View>

            <View style={styles.productRow}>
              <Ionicons name="cube-outline" size={15} color="#64748B" />
              <Text style={styles.deliveryValue}>
                {product?.name} - {formatProductQuantity(delivery.quantity, delivery.unit, product?.name)}
              </Text>
            </View>

            {delivery.address?.latitude && delivery.address?.longitude && (
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() =>
                  openExternalNavigation({
                    latitude: Number(delivery.address.latitude),
                    longitude: Number(delivery.address.longitude),
                    label: delivery.address?.description || "Destino de Entrega",
                  })
                }
                activeOpacity={0.85}
              >
                <Ionicons name="navigate" size={16} color="#FFFFFF" />
                <Text style={styles.navigationButtonText}>
                  Ver ubicación en GPS (Maps / Waze)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0F294A",
  },
  deliveryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 6,
  },
  deliveryAddress: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F294A",
    lineHeight: 20,
    flex: 1,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
    paddingLeft: 2,
  },
  deliveryValue: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  navigationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0284C7",
    marginTop: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navigationButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});

