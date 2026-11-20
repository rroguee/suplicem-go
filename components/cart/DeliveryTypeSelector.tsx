import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface DeliveryTypeSelectorProps {
  deliveryType: string;
  onUpdateDeliveryType: (type: "domicilio" | "almacen") => void;
}

export const DeliveryTypeSelector: React.FC<DeliveryTypeSelectorProps> = ({
  deliveryType,
  onUpdateDeliveryType,
}) => {
  return (
    <>
      <Text style={styles.sectionHeading}>Tipo de Entrega</Text>
      <View style={styles.deliveryTypeRow}>
        <TouchableOpacity
          style={[
            styles.deliveryTypeCard,
            deliveryType === "domicilio" && styles.deliveryTypeCardActive,
          ]}
          onPress={() => onUpdateDeliveryType("domicilio")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeaderRow}>
            <Ionicons
              name="car-outline"
              size={22}
              color={deliveryType === "domicilio" ? Palette.primary : "#64748B"}
            />
            <Ionicons
              name={
                deliveryType === "domicilio"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={18}
              color={deliveryType === "domicilio" ? Palette.primary : "#94A3B8"}
            />
          </View>
          <Text
            style={[
              styles.deliveryTypeTitle,
              deliveryType === "domicilio" && styles.deliveryTypeTitleActive,
            ]}
          >
            A Domicilio / Obra
          </Text>
          <Text style={styles.deliveryTypeSub}>
            Llevamos el pedido hasta tu dirección
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deliveryTypeCard,
            deliveryType === "almacen" && styles.deliveryTypeCardActive,
          ]}
          onPress={() => onUpdateDeliveryType("almacen")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeaderRow}>
            <Ionicons
              name="business-outline"
              size={22}
              color={deliveryType === "almacen" ? Palette.primary : "#64748B"}
            />
            <Ionicons
              name={
                deliveryType === "almacen"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={18}
              color={deliveryType === "almacen" ? Palette.primary : "#94A3B8"}
            />
          </View>
          <Text
            style={[
              styles.deliveryTypeTitle,
              deliveryType === "almacen" && styles.deliveryTypeTitleActive,
            ]}
          >
            Retiro en Almacén
          </Text>
          <Text style={styles.deliveryTypeSub}>
            Retiras en nuestra sede principal
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default DeliveryTypeSelector;

const styles = StyleSheet.create({
  sectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: Palette.primaryDark,
    marginBottom: 4,
  },
  deliveryTypeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    marginTop: 6,
  },
  deliveryTypeCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  deliveryTypeCardActive: {
    borderColor: Palette.primary,
    backgroundColor: "#F0F7FF",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  deliveryTypeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 2,
  },
  deliveryTypeTitleActive: {
    color: Palette.primary,
  },
  deliveryTypeSub: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 14,
  },
});
