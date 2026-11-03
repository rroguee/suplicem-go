import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "@/components/StatusBadge";
import { tonsToBags } from "@/constants/cartConstants";
import { calculateTripEstimate, WAREHOUSE_LOCATION } from "@/utils/tripEstimate";

interface ClientTripCardProps {
  trip: any;
  index: number;
  onCallDriver?: (phone?: string) => void;
  onWhatsappDriver?: (phone?: string) => void;
  isCementOrder?: boolean;
  cementProductName?: string;
  destination?: { latitude?: number | string; longitude?: number | string } | null;
}

export const ClientTripCard: React.FC<ClientTripCardProps> = ({
  trip,
  index,
  onCallDriver,
  onWhatsappDriver,
  isCementOrder = true,
  cementProductName,
  destination,
}) => {
  const driver = trip.driver;
  const isCompleted = trip.status === "completed";
  const tripTons = Number(trip.totalTons) || 0;
  const tripBags = tonsToBags(tripTons, cementProductName);
  const estimate =
    destination?.latitude && destination?.longitude
      ? calculateTripEstimate(WAREHOUSE_LOCATION, {
          latitude: Number(destination.latitude),
          longitude: Number(destination.longitude),
        })
      : null;

  return (
    <View style={[styles.card, isCompleted && styles.completedCard]}>
      {/* Encabezado del Camión */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.truckIcon}>🚚</Text>
          <View>
            <Text style={styles.tripTitle}>
              Viaje {index + 1}
              {trip.tripNumber ? ` • ${trip.tripNumber}` : ""}
            </Text>
            <Text style={styles.tonsSubtext}>
              Carga: <Text style={styles.bold}>{tripTons.toFixed(1)} t</Text>
              {isCementOrder && tripBags > 0 ? ` (${tripBags.toLocaleString()} fundas)` : ""}
            </Text>
          </View>
        </View>
        <StatusBadge status={trip.status || "available"} size="small" />
      </View>

      {!isCompleted && estimate && (
        <View style={styles.etaBadge}>
          <Ionicons name="time-outline" size={14} color="#1E40AF" />
          <Text style={styles.etaText}>
            Llegada estimada: ~{estimate.durationMinutes} min ({estimate.distanceKm} km)
          </Text>
        </View>
      )}

      {/* Datos del Conductor */}
      <View style={styles.driverSection}>
        {driver?.names ? (
          <View style={styles.driverBox}>
            <View style={styles.driverInfoRow}>
              <Ionicons name="person-circle-outline" size={20} color="#0F294A" />
              <Text style={styles.driverName}>
                {driver.names} {driver.lastNames || ""}
              </Text>
            </View>

            {driver.vehicle?.plateNumber ? (
              <Text style={styles.vehicleInfo}>
                🚗 {driver.vehicle.brand} {driver.vehicle.model || ""} • Placa: {driver.vehicle.plateNumber}
              </Text>
            ) : null}

            {/* Acciones de contacto */}
            {!isCompleted && driver.phone ? (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onCallDriver && onCallDriver(driver.phone)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={13} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Llamar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.whatsappButton]}
                  onPress={() => onWhatsappDriver && onWhatsappDriver(driver.phone)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-whatsapp" size={13} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.unassignedBox}>
            <Ionicons name="time-outline" size={18} color="#D97706" />
            <Text style={styles.unassignedText}>
              Bolsa General • Chofer preparándose o por asignar
            </Text>
          </View>
        )}
      </View>

      {/* PIN de Entrega Único para este Camión */}
      {!isCompleted && trip.deliveryPin ? (
        <View style={styles.pinContainer}>
          <View style={styles.pinHeader}>
            <Ionicons name="key-outline" size={16} color="#166534" />
            <Text style={styles.pinLabel}>PIN para este camión:</Text>
            <View style={styles.pinBadge}>
              <Text style={styles.pinValue}>{trip.deliveryPin}</Text>
            </View>
          </View>
          <Text style={styles.pinHint}>
            Indica este código exclusivamente al chofer que llegue con esta carga.
          </Text>
        </View>
      ) : isCompleted ? (
        <View style={styles.completedBanner}>
          <Ionicons name="checkmark-done-circle" size={18} color="#16A34A" />
          <Text style={styles.completedText}>Carga entregada y confirmada</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  completedCard: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  truckIcon: {
    fontSize: 22,
  },
  tripTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F294A",
  },
  tonsSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  bold: {
    fontWeight: "bold",
    color: "#0F294A",
  },
  etaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  etaText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
    flex: 1,
  },
  driverSection: {
    marginBottom: 10,
  },
  driverBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  driverInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  driverName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  vehicleInfo: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 6,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0284C7",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  whatsappButton: {
    backgroundColor: "#16A34A",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  unassignedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFBEB",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  unassignedText: {
    fontSize: 12,
    color: "#92400E",
    flex: 1,
  },
  pinContainer: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 10,
    padding: 10,
  },
  pinHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  pinLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
  },
  pinBadge: {
    backgroundColor: "#166534",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pinValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  pinHint: {
    fontSize: 11,
    color: "#15803D",
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    padding: 8,
    borderRadius: 8,
  },
  completedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
  },
});
