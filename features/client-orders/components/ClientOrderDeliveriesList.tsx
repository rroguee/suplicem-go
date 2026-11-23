import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { openExternalNavigation } from "@/utils/navigationUtils";
import { formatProductQuantity } from "@/constants/cartConstants";
import { styles } from "../styles/clientOrderDetail.styles";

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
            <Text style={styles.deliveryAddress}>
              📍 {delivery.address?.description}
              {delivery.address?.additionalInfo ? `, ${delivery.address.additionalInfo}` : ""}
            </Text>
            <Text style={styles.deliveryValue}>
              🪣 {product?.name} - {formatProductQuantity(delivery.quantity, delivery.unit, product?.name)}
            </Text>

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
                <Ionicons name="compass-outline" size={16} color="#FFFFFF" />
                <Text style={styles.navigationButtonText}>
                  🗺️ Ver ubicación en GPS (Google Maps / Waze)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
};
