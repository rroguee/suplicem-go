import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/types/users";
import { Trip } from "@/types/trips";

interface DriverCardItemProps {
  driver: User;
  orderTons: number;
  isFractional?: boolean;
  isSelected: boolean;
  activeTrip?: Trip;
  onSelect: () => void;
}

export const DriverCardItem: React.FC<DriverCardItemProps> = ({
  driver,
  orderTons,
  isFractional,
  isSelected,
  activeTrip,
  onSelect,
}) => {
  const capacity = Number(driver.vehicle?.tons) || 0;
  const isEnRoute = !!activeTrip;
  const requiredTrips = capacity > 0 ? Math.ceil(orderTons / capacity) : 1;

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Ionicons name="person-circle-outline" size={24} color="#0F294A" />
          <Text style={styles.driverName}>
            [{driver.driverCode || "COND-" + (driver.uid?.slice(0, 5).toUpperCase() || "XXXX")}] {driver.names} {driver.lastNames}
          </Text>
        </View>
        <Ionicons
          name={isSelected ? "radio-button-on" : "radio-button-off"}
          size={20}
          color={isSelected ? "#0F294A" : "#94A3B8"}
        />
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.plateText}>
          🚗 {driver.vehicle?.model || "Vehículo"} {driver.vehicle?.plateNumber ? `(${driver.vehicle.plateNumber})` : ""}
        </Text>
        <Text style={styles.capacityText}>
          🏋️ Capacidad: <Text style={styles.bold}>{capacity > 0 ? `${capacity.toFixed(2)} t` : "No registrada"}</Text>
        </Text>
      </View>

      <View style={styles.statusRow}>
        {isEnRoute ? (
          <View style={styles.enRouteBadge}>
            <Ionicons name="navigate-circle-outline" size={14} color="#C2410C" />
            <Text style={styles.enRouteText}>
              En ruta: Viaje #{activeTrip.tripNumber || activeTrip.id?.slice(0, 6)} ({activeTrip.totalTons || 0} t)
            </Text>
          </View>
        ) : (
          <View style={styles.availableBadge}>
            <Ionicons name="checkmark-circle-outline" size={14} color="#15803D" />
            <Text style={styles.availableText}>Disponible</Text>
          </View>
        )}
      </View>

      {capacity > 0 && orderTons > 0 && (
        <View style={[styles.tripsInfoBox, styles.okBox]}>
          <Ionicons name="information-circle-outline" size={16} color="#0369A1" />
          <Text style={[styles.tripsInfoText, styles.okText]}>
            {requiredTrips === 1
              ? (isFractional ? "Completa la carga restante en 1 solo viaje" : "Completa la orden en 1 solo viaje")
              : (isFractional
                  ? `Completará la carga restante en ${requiredTrips} viajes de hasta ${capacity.toFixed(2)} t`
                  : `Completará la orden en ${requiredTrips} viajes de hasta ${capacity.toFixed(2)} t`)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    padding: 12,
    marginBottom: 10,
  },
  selectedCard: {
    borderColor: "#0F294A",
    backgroundColor: "#F0F7FF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F294A",
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  plateText: {
    fontSize: 12,
    color: "#475569",
  },
  capacityText: {
    fontSize: 12,
    color: "#475569",
  },
  bold: {
    fontWeight: "700",
    color: "#0F294A",
  },
  statusRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  enRouteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFEDD5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  enRouteText: {
    fontSize: 11,
    color: "#C2410C",
    fontWeight: "600",
  },
  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  availableText: {
    fontSize: 11,
    color: "#15803D",
    fontWeight: "600",
  },
  tripsInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  okBox: {
    backgroundColor: "#F0F9FF",
  },
  tripsInfoText: {
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
  },
  okText: {
    color: "#0369A1",
  },
});
