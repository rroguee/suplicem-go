import React from "react";
import { View, Text } from "react-native";
import { formatRD } from "@/utils/currencyUtils";
import { formatProductQuantity } from "@/constants/cartConstants";
import { styles } from "../styles/clientOrderDetail.styles";

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
          <Text style={styles.productTitle}>🛒 Producto {index + 1}</Text>
          <Text style={styles.productLine}>
            📄 <Text style={styles.bold}>Descripción:</Text> {item.name}
          </Text>
          <Text style={styles.productLine}>
            📦 <Text style={styles.bold}>Cantidad:</Text>{" "}
            {formatProductQuantity(item.quantity, item.unit, item.name)}
          </Text>
          <Text style={styles.productLine}>
            💰 <Text style={styles.bold}>Monto total:</Text> {formatRD(item.subtotal)}
          </Text>
        </View>
      ))}
    </View>
  );
};
