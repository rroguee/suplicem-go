import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { Order } from "@/types/orders";
import { AssistedOrderBanner } from "./AssistedOrderBanner";

interface AdminOrderHeaderProps {
  order: Order;
  isEditing: boolean;
  isSaving: boolean;
  editedDeliveryType: string;
  setEditedDeliveryType: (type: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const AdminOrderHeader: React.FC<AdminOrderHeaderProps> = ({
  order,
  isEditing,
  isSaving,
  editedDeliveryType,
  setEditedDeliveryType,
  onEdit,
  onSave,
  onCancel,
}) => {
  const deliveryAddress =
    order.deliveryAddress || order.deliveries?.[0]?.address;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Detalle de Orden {order.orderNumber ? `${ORDER_PREFIX.ORD}${order.orderNumber}` : ""}
      </Text>

      {/* Botones de acción principales */}
      {isEditing ? (
        <View style={styles.headerButtonsRow}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
            onPress={onSave}
            disabled={isSaving}
          >
            <Text style={styles.buttonText}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>Editar Orden</Text>
        </TouchableOpacity>
      )}

      {/* Tarjeta de Datos del Cliente */}
      <View style={styles.clientCard}>
        <Text style={styles.cardSectionTitle}>Datos del Cliente</Text>

        <View style={styles.clientInfoRow}>
          <Ionicons name="person" size={18} color="#555" />
          <Text style={styles.clientName}>
            {order.userNames} {order.userLastNames}
          </Text>
        </View>

        {Boolean(order.userPhone) && (
          <View style={styles.clientInfoRow}>
            <Ionicons name="call" size={18} color="#555" />
            <Text style={styles.clientPhone}>Teléfono: {order.userPhone}</Text>
          </View>
        )}

        {Boolean(order.userPhone) && (
          <View style={styles.contactButtonsRow}>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => Linking.openURL(`tel:${order.userPhone}`)}
            >
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.contactButtonText}>Llamar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={() => {
                const rawPhone = (order.userPhone || "").replace(/\D/g, "");
                const phone = rawPhone.length === 10 ? `1${rawPhone}` : rawPhone;
                Linking.openURL(`whatsapp://send?phone=${phone}`);
              }}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text style={styles.contactButtonText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Banner de Pedido Asistido */}
        <AssistedOrderBanner order={order} />

        {/* Tipo de entrega */}
        <View style={styles.deliveryTypeRow}>
          <Text style={styles.deliveryTypeLabel}>Tipo de entrega:</Text>
          {isEditing ? (
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentedButton,
                  editedDeliveryType === "domicilio" && styles.segmentedButtonActive,
                ]}
                onPress={() => setEditedDeliveryType("domicilio")}
              >
                <Text
                  style={[
                    styles.segmentedButtonText,
                    editedDeliveryType === "domicilio" && styles.segmentedButtonTextActive,
                  ]}
                >
                  Domicilio
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentedButton,
                  editedDeliveryType === "almacen" && styles.segmentedButtonActive,
                ]}
                onPress={() => setEditedDeliveryType("almacen")}
              >
                <Text
                  style={[
                    styles.segmentedButtonText,
                    editedDeliveryType === "almacen" && styles.segmentedButtonTextActive,
                  ]}
                >
                  Almacén
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.deliveryTypeValue}>
              {order.deliveryType === "domicilio"
                ? "A Domicilio / Obra"
                : "Retiro en Almacén"}
            </Text>
          )}
        </View>

        {/* Dirección de entrega separada limpiamente abajo */}
        {order.deliveryType === "domicilio" && Boolean(deliveryAddress) && (
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Dirección de entrega:</Text>
            <Text style={styles.addressText}>
              📍 {deliveryAddress?.description}
              {deliveryAddress?.additionalInfo ? ` (${deliveryAddress.additionalInfo})` : ""}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C1810",
    textAlign: "center",
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: "#A04A0E",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F44336",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  clientCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C1810",
    marginBottom: 12,
  },
  clientInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  clientPhone: {
    fontSize: 15,
    color: "#475569",
  },
  contactButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    marginBottom: 14,
  },
  callButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: "#16A34A",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  contactButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  deliveryTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  deliveryTypeLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#475569",
  },
  deliveryTypeValue: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "500",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 3,
  },
  segmentedButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  segmentedButtonActive: {
    backgroundColor: "#A04A0E",
  },
  segmentedButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  segmentedButtonTextActive: {
    color: "#fff",
  },
  addressContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  addressLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  addressText: {
    fontSize: 13,
    color: "#1E293B",
    marginTop: 3,
    fontWeight: "500",
  },
});
