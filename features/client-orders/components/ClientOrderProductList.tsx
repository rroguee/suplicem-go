import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InfoRow from "@/components/InfoRow";
import { formatRD } from "@/utils/currencyUtils";
import { formatProductQuantity } from "@/constants/cartConstants";

interface ClientOrderProductListProps {
  items?: any[];
}

export const ClientOrderProductList: React.FC<ClientOrderProductListProps> = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Productos</Text>
      {items.map((item: any, index: number) => (
        <View key={item.id || index} style={styles.productCard}>
          <View style={styles.productHeader}>
            <Ionicons name="cube-outline" size={17} color="#0284C7" />
            <Text style={styles.productTitle}>Producto {index + 1}</Text>
          </View>
          <InfoRow
            icon="document-text-outline"
            label="Descripción"
            value={item.name}
          />
          <InfoRow
            icon="layers-outline"
            label="Cantidad"
            value={formatProductQuantity(item.quantity, item.unit, item.name)}
          />
          <InfoRow
            icon="cash-outline"
            label="Monto total"
            value={formatRD(item.subtotal)}
          />
        </View>
      ))}
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
  productCard: {
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
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  productTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F294A",
  },
});

