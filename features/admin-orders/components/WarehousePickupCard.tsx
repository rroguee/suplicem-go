import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface WarehousePickupCardProps {
  status: string;
  isDelivery: boolean;
  isEditing: boolean;
  onCompletePickup: () => void;
}

export const WarehousePickupCard: React.FC<WarehousePickupCardProps> = ({
  status,
  isDelivery,
  isEditing,
  onCompletePickup,
}) => {
  if (isDelivery || isEditing) return null;

  const handleConfirmPickup = () => {
    Alert.alert(
      "Confirmar Retiro en Almacén",
      "¿Confirmas que el cliente ha recibido todos los materiales en el almacén?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar Entrega", style: "default", onPress: onCompletePickup },
      ]
    );
  };

  if (status === "approved") {
    return (
      <View style={styles.pickupActionCard}>
        <View style={styles.pickupActionHeader}>
          <Ionicons name="storefront" size={24} color="#166534" />
          <View style={styles.pickupActionTextWrap}>
            <Text style={styles.pickupActionTitle}>Retiro en Almacén Pendiente</Text>
            <Text style={styles.pickupActionSubtitle}>
              El cliente debe retirar los materiales directamente en el almacén.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.completePickupButton}
          onPress={handleConfirmPickup}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.completePickupButtonText}>Confirmar Retiro en Almacén</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === "completed") {
    return (
      <View style={styles.pickupCompletedCard}>
        <Ionicons name="checkmark-done-circle" size={26} color="#166534" />
        <Text style={styles.pickupCompletedText}>
          Materiales entregados en almacén exitosamente.
        </Text>
      </View>
    );
  }

  return null;
};

export default WarehousePickupCard;

const styles = StyleSheet.create({
  pickupActionCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 16,
    marginVertical: 16,
    elevation: 2,
  },
  pickupActionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  pickupActionTextWrap: {
    marginLeft: 12,
    flex: 1,
  },
  pickupActionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#166534",
  },
  pickupActionSubtitle: {
    fontSize: 13,
    color: "#15803D",
    marginTop: 2,
  },
  completePickupButton: {
    backgroundColor: "#166534",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 8,
  },
  completePickupButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  pickupCompletedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#86EFAC",
    marginVertical: 16,
    gap: 10,
  },
  pickupCompletedText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    flex: 1,
  },
});
