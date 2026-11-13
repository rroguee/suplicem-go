import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomPickerModal from "@/components/CustomPickerModal";
import { Address } from "@/types/users";
import { DeliveryDetail } from "@/types/orders";

interface DeliveryEditCardProps {
  delivery: any;
  index: number;
  clientName: string;
  productOptions: { label: string; value: string }[];
  onUpdateDelivery: (id: string, values: Partial<DeliveryDetail>) => void;
}

export const DeliveryEditCard: React.FC<DeliveryEditCardProps> = ({
  delivery,
  index,
  clientName,
  productOptions,
  onUpdateDelivery,
}) => {
  return (
    <View style={styles.deliveryCard}>
      <View style={styles.headerRow}>
        <Text style={styles.deliveryCardTitle}>Punto de Entrega</Text>
      </View>

      {/* Usuario Destinatario (Fijo al cliente de la orden) */}
      <Text style={styles.deliveryEditLabel}>Usuario Destinatario</Text>
      <View style={styles.readOnlyUserBox}>
        <Ionicons name="person-circle-outline" size={20} color="#0F294A" />
        <Text style={styles.readOnlyUserName} numberOfLines={1}>
          {clientName || "Cliente de la orden"}
        </Text>
        <View style={styles.fixedBadge}>
          <Text style={styles.fixedBadgeText}>Cliente</Text>
        </View>
      </View>

      {/* Selector de Dirección */}
      <Text style={styles.deliveryEditLabel}>Dirección de Entrega</Text>
      <CustomPickerModal
        label="Seleccionar dirección"
        selectedValue={delivery.address?.placeId ?? ""}
        onValueChange={(value) => {
          const fullAddress =
            delivery.availableAddresses?.find(
              (addr: Address) => addr.placeId === value
            ) || delivery.address;
          if (fullAddress) {
            onUpdateDelivery(delivery.id, { address: fullAddress });
          }
        }}
        options={[
          { label: "Seleccionar dirección", value: "" },
          ...(delivery.availableAddresses?.map((addr: Address) => ({
            label: `${addr?.description}${
              addr?.additionalInfo ? ", " + addr.additionalInfo : ""
            }`,
            value: addr?.placeId,
          })) || []),
        ]}
      />

      {/* Selector de Producto */}
      <Text style={styles.deliveryEditLabel}>Producto</Text>
      <CustomPickerModal
        label="Seleccionar producto"
        selectedValue={delivery.productId}
        onValueChange={(value) =>
          onUpdateDelivery(delivery.id, { productId: value })
        }
        options={[{ label: "Seleccionar", value: "" }, ...productOptions]}
      />

      {/* Selector de Cantidad con botones rápidos (-50, +50, +500) como en Orden Asistida */}
      <Text style={styles.deliveryEditLabel}>
        Cantidad ({delivery.unit || "fundas"})
      </Text>
      <View style={styles.quantityContainer}>
        <View style={styles.quantityInputWrapper}>
          <TextInput
            style={styles.quantityInput}
            keyboardType="numeric"
            value={
              delivery.quantity !== undefined &&
              delivery.quantity !== null &&
              delivery.quantity > 0
                ? String(delivery.quantity)
                : ""
            }
            placeholder="0"
            placeholderTextColor="#94A3B8"
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, "");
              const num = parseInt(cleaned, 10) || 0;
              onUpdateDelivery(delivery.id, { quantity: num });
            }}
          />
          <Text style={styles.unitSuffix}>{delivery.unit || "fundas"}</Text>
        </View>

        <View style={styles.stepButtonsRow}>
          <TouchableOpacity
            style={styles.stepBtn}
            activeOpacity={0.7}
            onPress={() => {
              const current = Number(delivery.quantity) || 0;
              onUpdateDelivery(delivery.id, {
                quantity: Math.max(0, current - 50),
              });
            }}
          >
            <Text style={styles.stepBtnText}>-50</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stepBtn}
            activeOpacity={0.7}
            onPress={() => {
              const current = Number(delivery.quantity) || 0;
              onUpdateDelivery(delivery.id, { quantity: current + 50 });
            }}
          >
            <Text style={styles.stepBtnText}>+50</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.stepBtn, styles.stepBtnLot]}
            activeOpacity={0.7}
            onPress={() => {
              const current = Number(delivery.quantity) || 0;
              onUpdateDelivery(delivery.id, { quantity: current + 500 });
            }}
          >
            <Text style={[styles.stepBtnText, styles.stepBtnLotText]}>
              +500 Lote
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  deliveryCardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F294A",
  },
  deliveryEditLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 8,
    marginBottom: 4,
  },
  readOnlyUserBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  readOnlyUserName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F294A",
  },
  fixedBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fixedBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#475569",
  },
  quantityContainer: {
    gap: 8,
  },
  quantityInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
  },
  quantityInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F294A",
  },
  unitSuffix: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginLeft: 6,
  },
  stepButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  stepBtn: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  stepBtnLot: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
  },
  stepBtnLotText: {
    color: "#C2410C",
  },
});
