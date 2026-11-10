import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface TruckTripItem {
  id: string;
  totalTons: number;
  driverId?: string;
  driverName?: string;
  comments?: string;
  deliveryId?: string;
}

interface Props {
  truck: TruckTripItem;
  index: number;
  onUpdateTons: (tons: number) => void;
  onOpenDriverModal: () => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const TripTruckRow: React.FC<Props> = ({
  truck,
  index,
  onUpdateTons,
  onOpenDriverModal,
  onRemove,
  canRemove,
}) => {
  const estFundas = Math.round((truck.totalTons * 1000) / 42.5);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.truckBadge}>
          <Ionicons name="bus-outline" size={16} color="#0F294A" />
          <Text style={styles.truckBadgeText}>Camión #{index + 1}</Text>
        </View>

        {canRemove && (
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bodyRow}>
        {/* Tonelaje y cálculo */}
        <View style={styles.tonnageWrap}>
          <Text style={styles.inputLabel}>Carga (Toneladas)</Text>
          <View style={styles.tonsControls}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => onUpdateTons(Math.max(1, Number((truck.totalTons - 1).toFixed(2))))}
            >
              <Text style={styles.stepBtnText}>-1</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.tonsInput}
              keyboardType="numeric"
              value={String(truck.totalTons)}
              onChangeText={(text) => {
                const val = parseFloat(text.replace(/[^0-9.]/g, "")) || 0;
                onUpdateTons(val);
              }}
            />

            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => onUpdateTons(Number((truck.totalTons + 1).toFixed(2)))}
            >
              <Text style={styles.stepBtnText}>+1</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fundasHint}>~{estFundas} fundas aprox.</Text>
        </View>

        {/* Asignación de Chofer */}
        <View style={styles.driverWrap}>
          <Text style={styles.inputLabel}>Conductor Asignado</Text>
          <TouchableOpacity
            style={[
              styles.driverButton,
              truck.driverId ? styles.driverAssigned : styles.driverUnassigned,
            ]}
            onPress={onOpenDriverModal}
            activeOpacity={0.8}
          >
            <Ionicons
              name={truck.driverId ? "person" : "person-add-outline"}
              size={15}
              color={truck.driverId ? "#166534" : "#0F294A"}
            />
            <Text
              style={[
                styles.driverButtonText,
                truck.driverId ? styles.driverAssignedText : styles.driverUnassignedText,
              ]}
              numberOfLines={1}
            >
              {truck.driverName || "Bolsa (Disponible)"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  truckBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  truckBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F294A",
  },
  bodyRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  tonnageWrap: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  tonsControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tonsInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F294A",
    paddingVertical: 6,
  },
  stepBtn: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  stepBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#334155",
  },
  fundasHint: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
  },
  driverWrap: {
    flex: 1.2,
  },
  driverButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  driverAssigned: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
  },
  driverUnassigned: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CBD5E1",
  },
  driverButtonText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  driverAssignedText: {
    color: "#166534",
  },
  driverUnassignedText: {
    color: "#0F294A",
  },
});