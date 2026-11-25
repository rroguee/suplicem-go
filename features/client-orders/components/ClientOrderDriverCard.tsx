import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ContactButtonsRow } from "@/components/ContactButtonsRow";

interface ClientOrderDriverCardProps {
  driver: any;
  onCallDriver: () => void;
  onWhatsappDriver: (phone?: string) => void;
}

export const ClientOrderDriverCard: React.FC<ClientOrderDriverCardProps> = ({
  driver,
  onCallDriver,
  onWhatsappDriver,
}) => {
  if (!driver) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="bus-outline" size={18} color="#0284C7" />
        <Text style={styles.sectionSubtitle}>
          Conductor y Vehículo de Despacho
        </Text>
      </View>

      <View style={styles.driverInfoCard}>
        <View style={styles.driverDataRow}>
          <Ionicons name="person-outline" size={16} color="#64748B" />
          <Text style={styles.driverLabel}>Conductor:</Text>
          <Text style={styles.driverValue}>
            {driver?.names} {driver?.lastNames}
          </Text>
        </View>

        <View style={styles.driverDataRow}>
          <Ionicons name="call-outline" size={16} color="#64748B" />
          <Text style={styles.driverLabel}>Teléfono:</Text>
          <Text style={styles.driverValue}>{driver?.phone || "No registrado"}</Text>
        </View>

        {driver?.vehicle && (
          <View style={styles.driverPlateBadge}>
            <Ionicons name="car-sport" size={20} color="#0F294A" />
            <View style={{ flex: 1 }}>
              <Text style={styles.driverPlateLabel}>
                NÚMERO DE PLACA VEHICULAR
              </Text>
              <Text style={styles.driverPlateNumber}>
                {driver.vehicle.plateNumber || "No registrada"}
              </Text>
              <Text style={styles.driverVehicleModel}>
                {driver.vehicle.brand} {driver.vehicle.model}{" "}
                {driver.vehicle.year ? `(${driver.vehicle.year})` : ""}
              </Text>
            </View>
          </View>
        )}
      </View>

      <ContactButtonsRow
        onCall={onCallDriver}
        onWhatsapp={() => onWhatsappDriver(driver?.phone)}
        callLabel="Llamar al conductor"
        whatsappLabel="WhatsApp"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F294A",
  },
  driverInfoCard: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
    gap: 6,
  },
  driverDataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  driverLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    width: 80,
  },
  driverValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
    flex: 1,
  },
  driverPlateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDF2F7",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  driverPlateLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  driverPlateNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
    letterSpacing: 1,
  },
  driverVehicleModel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
});
