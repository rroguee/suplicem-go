import React from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ClientOrderMap } from "./ClientOrderMap";
import StatusBadge from "@/components/StatusBadge";

interface ClientTripTrackingModalProps {
  visible: boolean;
  trip: any | null;
  tripIndex?: number;
  deliveries?: any[];
  orderId?: string;
  onClose: () => void;
  onCallDriver?: (phone?: string) => void;
  onWhatsappDriver?: (phone?: string) => void;
}

export const ClientTripTrackingModal: React.FC<ClientTripTrackingModalProps> = ({
  visible,
  trip,
  tripIndex = 0,
  deliveries,
  orderId,
  onClose,
  onCallDriver,
  onWhatsappDriver,
}) => {
  if (!trip) return null;

  const driver = trip.driver;
  const isCompleted = trip.status === "completed";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.modalTitle}>
              Viaje {tripIndex + 1}
              {trip.tripNumber ? ` • ${trip.tripNumber}` : ""}
            </Text>
            <Text style={styles.modalSubtitle}>Seguimiento en vivo del camión</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="#0F294A" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Tarjeta Informativa del Camión y Chofer */}
          <View style={styles.infoBanner}>
            <View style={styles.driverRow}>
              <Ionicons name="person-circle-outline" size={22} color="#0F294A" />
              <Text style={styles.driverName}>
                {driver?.names ? `${driver.names} ${driver.lastNames || ""}` : "Chofer por asignar"}
              </Text>
              <StatusBadge status={trip.status || "accepted"} size="small" />
            </View>

            {driver?.vehicle?.plateNumber && (
              <Text style={styles.vehicleText}>
                🚗 {driver.vehicle.brand} {driver.vehicle.model || ""} • Placa: {driver.vehicle.plateNumber}
              </Text>
            )}

            {/* PIN Único de Entrega */}
            {!isCompleted && trip.deliveryPin && (
              <View style={styles.pinContainer}>
                <Ionicons name="key-outline" size={15} color="#166534" />
                <Text style={styles.pinLabel}>PIN para este camión:</Text>
                <View style={styles.pinBadge}>
                  <Text style={styles.pinValue}>{trip.deliveryPin}</Text>
                </View>
              </View>
            )}

            {/* Acciones de contacto */}
            {!isCompleted && driver?.phone && (
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
            )}
          </View>

          {/* Mapa con la ruta y ubicación específica del camión */}
          <ClientOrderMap
            driverLocation={trip.location || null}
            trip={trip}
            deliveries={deliveries}
            orderId={orderId}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#fff8f3",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  driverName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F294A",
    flex: 1,
  },
  vehicleText: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 6,
  },
  pinContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
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
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0284C7",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  whatsappButton: {
    backgroundColor: "#16A34A",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
