import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TripTruckRow, TruckTripItem } from "./TripTruckRow";

interface DeliveryInfo {
  id?: string;
  index: number;
  addressDescription: string;
  recipientName?: string;
  quantityFundas: number;
  totalTons: number;
  trucks: TruckTripItem[];
}

interface Props {
  delivery: DeliveryInfo;
  onAddTruck: () => void;
  onUpdateTruckTons: (truckId: string, tons: number) => void;
  onOpenDriverModal: (truckId: string) => void;
  onRemoveTruck: (truckId: string) => void;
}

export const DeliveryApprovalCard: React.FC<Props> = ({
  delivery,
  onAddTruck,
  onUpdateTruckTons,
  onOpenDriverModal,
  onRemoveTruck,
}) => {
  const plannedTons = delivery.trucks.reduce((sum, t) => sum + (Number(t.totalTons) || 0), 0);
  const diff = Number((plannedTons - delivery.totalTons).toFixed(2));
  const isBalanced = Math.abs(diff) < 0.05;

  return (
    <View style={styles.card}>
      {/* Cabecera de la Entrega */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Ionicons name="location" size={18} color="#EA580C" />
          <Text style={styles.headerTitle}>Entrega #{delivery.index + 1}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {delivery.quantityFundas} fundas ({delivery.totalTons.toFixed(2)} t)
          </Text>
        </View>
      </View>

      <Text style={styles.addressText} numberOfLines={2}>
        📍 {delivery.addressDescription || "Dirección no especificada"}
      </Text>
      {Boolean(delivery.recipientName) && (
        <Text style={styles.recipientText}>👤 Recibe: {delivery.recipientName}</Text>
      )}

      {/* Balance de Camiones */}
      <View style={[styles.balanceBar, isBalanced ? styles.balanceOk : styles.balancePending]}>
        <Text style={styles.balanceText}>
          Planificado en camiones: <Text style={{ fontWeight: "bold" }}>{plannedTons.toFixed(2)} t</Text> de {delivery.totalTons.toFixed(2)} t
        </Text>
        {!isBalanced && (
          <Text style={styles.diffWarning}>
            {diff > 0 ? `+${diff.toFixed(2)} t de más` : `${Math.abs(diff).toFixed(2)} t faltantes`}
          </Text>
        )}
      </View>

      {/* Lista de Camiones */}
      <View style={styles.trucksList}>
        {delivery.trucks.map((truck, idx) => (
          <TripTruckRow
            key={truck.id || `truck-${idx}`}
            truck={truck}
            index={idx}
            onUpdateTons={(tons) => onUpdateTruckTons(truck.id, tons)}
            onOpenDriverModal={() => onOpenDriverModal(truck.id)}
            onRemove={() => onRemoveTruck(truck.id)}
            canRemove={delivery.trucks.length > 1}
          />
        ))}
      </View>

      {/* Botón para agregar otro camión a esta entrega */}
      <TouchableOpacity
        style={styles.addTruckButton}
        onPress={onAddTruck}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={18} color="#0F294A" />
        <Text style={styles.addTruckButtonText}>Agregar Camión para esta Entrega</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  badge: {
    backgroundColor: "#FFEDD5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#C2410C",
  },
  addressText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  recipientText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  balanceBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 12,
  },
  balanceOk: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  balancePending: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  balanceText: {
    fontSize: 12,
    color: "#334155",
  },
  diffWarning: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#DC2626",
  },
  trucksList: {
    marginTop: 4,
  },
  addTruckButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
  },
  addTruckButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F294A",
  },
});