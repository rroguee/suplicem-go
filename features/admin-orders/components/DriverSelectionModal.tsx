import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/types/users";
import { Trip } from "@/types/trips";
import { Order } from "@/types/orders";
import { DriverCardItem } from "./DriverCardItem";

interface DriverSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order;
  targetTons?: number;
  drivers: User[];
  allTrips: Trip[];
  selectedDriverId: string;
  onSelectDriver: (driverId: string) => void;
}

export const DriverSelectionModal: React.FC<DriverSelectionModalProps> = ({
  visible,
  onClose,
  order,
  targetTons,
  drivers,
  allTrips,
  selectedDriverId,
  onSelectDriver,
}) => {
  const isFractional = typeof targetTons === "number";
  const displayTons = isFractional ? targetTons : (Number(order.totalTons || order.pendingBalance) || 0);
  const totalOrderTons = Number(order.totalTons || order.pendingBalance) || 0;

  const getDriverActiveTrip = (driverUid?: string) => {
    if (!driverUid) return undefined;
    return allTrips.find(
      (t) =>
        (t.assignedDriverId === driverUid || t.driverId === driverUid) &&
        (t.status === "accepted" || t.status === "started" || t.status === "in_progress")
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Asignar Conductor</Text>
              <Text style={styles.subtitle}>Selección basada en capacidad de carga</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Resumen Logístico de la Orden */}
          <View style={styles.orderSummaryCard}>
            {isFractional && (
              <View style={styles.subSummaryRow}>
                <Text style={styles.subSummaryLabel}>Total de la orden:</Text>
                <Text style={styles.subSummaryTons}>{totalOrderTons.toFixed(2)} t</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {isFractional ? "Carga faltante por programar:" : "Carga total de la orden:"}
              </Text>
              <Text style={styles.summaryTons}>{displayTons.toFixed(2)} t</Text>
            </View>
          </View>

          <ScrollView style={styles.driversList} showsVerticalScrollIndicator={false}>
            {/* Opción Bolsa General */}
            <TouchableOpacity
              style={[styles.unassignedCard, !selectedDriverId && styles.selectedUnassignedCard]}
              onPress={() => {
                onSelectDriver("");
                onClose();
              }}
            >
              <Ionicons name="globe-outline" size={22} color={!selectedDriverId ? "#0F294A" : "#64748B"} />
              <View style={styles.unassignedTextContainer}>
                <Text style={styles.unassignedTitle}>Sin asignar (Bolsa general)</Text>
                <Text style={styles.unassignedDesc}>Disponible para cualquier conductor que tenga capacidad.</Text>
              </View>
              <Ionicons
                name={!selectedDriverId ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={!selectedDriverId ? "#0F294A" : "#94A3B8"}
              />
            </TouchableOpacity>

            {/* Tarjetas de Conductores */}
            {drivers.map((drv) => (
              <DriverCardItem
                key={drv.uid}
                driver={drv}
                orderTons={displayTons}
                isFractional={isFractional}
                isSelected={selectedDriverId === drv.uid}
                activeTrip={getDriverActiveTrip(drv.uid)}
                onSelect={() => {
                  onSelectDriver(drv.uid || "");
                  onClose();
                }}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  orderSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  subSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  subSummaryLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  subSummaryTons: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#475569",
  },
  summaryTons: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  driversList: {
    marginBottom: 10,
  },
  unassignedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  selectedUnassignedCard: {
    borderColor: "#0F294A",
    backgroundColor: "#F0F7FF",
  },
  unassignedTextContainer: {
    flex: 1,
  },
  unassignedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F294A",
  },
  unassignedDesc: {
    fontSize: 11,
    color: "#64748B",
  },
});
