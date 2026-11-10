import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/types/users";
import { Order, DeliveryDetail as OrderDelivery } from "@/types/orders";
import { useAlert } from "@/context/alertContext";
import { DeliveryViewCard } from "./DeliveryViewCard";
import { DeliveryEditCard } from "./DeliveryEditCard";

interface DeliveriesSectionProps {
  order: Order;
  users: User[];
  isEditing: boolean;
  editedDeliveryType: string;
  editedDeliveries: OrderDelivery[];
  productOptions: { label: string; value: string }[];
  onAddDelivery: () => void;
  onUpdateDelivery: (id: string, values: Partial<OrderDelivery>) => void;
  onRemoveDelivery: (id: string) => void;
  onUserSelection: (userId: string, deliveryId: string) => void;
  onOpenNewAddressModal: () => void;
}

export const DeliveriesSection: React.FC<DeliveriesSectionProps> = ({
  order,
  users,
  isEditing,
  editedDeliveryType,
  editedDeliveries,
  productOptions,
  onAddDelivery,
  onUpdateDelivery,
  onRemoveDelivery,
  onUserSelection,
  onOpenNewAddressModal,
}) => {
  const { showAlert } = useAlert();

  const getAvailableQuantity = (
    productId: string,
    currentDeliveryId?: string
  ) => {
    const totalOrderedQuantity =
      order.items?.find((item) => item.productId === productId)?.quantity || 0;

    const allocatedQuantity = editedDeliveries.reduce((sum, del) => {
      if (del.productId === productId && currentDeliveryId && del.id !== currentDeliveryId) {
        return sum + (Number(del.quantity) || 0);
      }
      return sum;
    }, 0);

    return Math.max(0, totalOrderedQuantity - allocatedQuantity);
  };

  const validateQuantity = (
    delivery: OrderDelivery,
    newQuantity: number
  ): boolean => {
    const totalOrderedQuantity =
      order.items.find((item) => item.productId === delivery.productId)?.quantity || 0;

    const currentlyAllocatedOthers = editedDeliveries.reduce((sum, del) => {
      if (del.productId === delivery.productId && del.id !== delivery.id) {
        return sum + (Number(del.quantity) || 0);
      }
      return sum;
    }, 0);

    if (currentlyAllocatedOthers + newQuantity > totalOrderedQuantity) {
      showAlert({
        message: `La cantidad máxima permitida es de ${
          totalOrderedQuantity - currentlyAllocatedOthers
        }.`,
        type: "warning",
      });
      return false;
    }
    return true;
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Entregas</Text>

      <View style={styles.deliveriesContainer}>
        {isEditing && editedDeliveryType === "domicilio" ? (
          editedDeliveries.map((delivery, idx) => (
            <DeliveryEditCard
              key={delivery.id || `delivery-edit-${idx}`}
              delivery={delivery}
              index={idx}
              clientName={`${order.userNames || ""} ${order.userLastNames || ""}`.trim() || "Cliente de la orden"}
              productOptions={productOptions}
              onUpdateDelivery={onUpdateDelivery}
              onRemoveDelivery={onRemoveDelivery}
              canRemove={editedDeliveries.length > 1}
            />
          ))
        ) : (
          (order.deliveries || []).map((delivery, idx) => (
            <DeliveryViewCard
              key={delivery.id || `delivery-view-${idx}`}
              delivery={delivery}
              items={order.items || []}
              index={idx}
            />
          ))
        )}

        {isEditing && editedDeliveryType === "domicilio" && (
          <View style={styles.addDeliveryButtonsContainer}>
            <TouchableOpacity
              style={[styles.newAddressButton, { flex: 1 }]}
              onPress={onOpenNewAddressModal}
              activeOpacity={0.8}
            >
              <Ionicons name="location-outline" size={20} color="#fff" />
              <Text style={styles.addDeliveryButtonText}>Nueva Dirección</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
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
    color: "#2C1810",
    marginBottom: 12,
  },
  deliveriesContainer: {
    gap: 10,
  },
  addDeliveryButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  newAddressButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    borderRadius: 8,
  },
  addDeliveryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

