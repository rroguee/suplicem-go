import React, { useState, useEffect } from "react";
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
  const [inputValue, setInputValue] = useState(String(truck.totalTons));

  useEffect(() => {
    const currentNum = parseFloat(inputValue.replace(",", ".")) || 0;
    if (currentNum !== truck.totalTons) {
      setInputValue(truck.totalTons === 0 ? "" : String(truck.totalTons));
    }
  }, [truck.totalTons]);

  const handleChangeText = (text: string) => {
    let clean = text.replace(",", ".").replace(/[^0-9.]/g, "");
    const parts = clean.split(".");
    if (parts.length > 2) {
      clean = parts[0] + "." + parts.slice(1).join("");
    }
    setInputValue(clean);

    if (clean === "" || clean === ".") {
      onUpdateTons(0);
    } else {
      const val = parseFloat(clean);
      if (!isNaN(val)) {
        onUpdateTons(val);
      }
    }
  };

  const handleBlur = () => {
    const val = parseFloat(inputValue.replace(",", ".")) || 0;
    const formatted = val === 0 ? "0" : String(Number(val.toFixed(2)));
    setInputValue(formatted);
    onUpdateTons(Number(val.toFixed(2)));
  };

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

      {/* 1. Selector de Conductor a Ancho Completo (Elimina el truncado) */}
      <View style={styles.driverSection}>
        <Text style={styles.inputLabel}>Conductor Asignado</Text>
        <TouchableOpacity
          style={[
            styles.driverButton,
            truck.driverId ? styles.driverAssigned : styles.driverUnassigned,
          ]}
          onPress={onOpenDriverModal}
          activeOpacity={0.8}
        >
          <View style={styles.driverButtonLeft}>
            <Ionicons
              name={truck.driverId ? "person" : "person-add-outline"}
              size={16}
              color={truck.driverId ? "#166534" : "#0F294A"}
            />
            <Text
              style={[
                styles.driverButtonText,
                truck.driverId ? styles.driverAssignedText : styles.driverUnassignedText,
              ]}
              numberOfLines={1}
            >
              {truck.driverName || "Seleccionar Conductor"}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={truck.driverId ? "#166534" : "#94A3B8"}
          />
        </TouchableOpacity>
      </View>

      {/* 2. Control de Carga con Stepper Ergonómico */}
      <View style={styles.tonnageSection}>
        <View style={styles.tonnageHeader}>
          <Text style={styles.inputLabel}>Carga Asignada</Text>
          <Text style={styles.fundasHint}>~{estFundas} fundas aprox.</Text>
        </View>

        <View style={styles.tonsControls}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => onUpdateTons(Math.max(1, Number((truck.totalTons - 1).toFixed(2))))}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={18} color="#334155" />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.tonsInput}
              keyboardType="decimal-pad"
              value={inputValue}
              onChangeText={handleChangeText}
              onBlur={handleBlur}
              selectTextOnFocus
            />
            <Text style={styles.unitSuffix}>t</Text>
          </View>

          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => onUpdateTons(Number((truck.totalTons + 1).toFixed(2)))}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color="#334155" />
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
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  driverSection: {
    marginBottom: 12,
  },
  driverButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  driverButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
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
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  driverAssignedText: {
    color: "#166534",
  },
  driverUnassignedText: {
    color: "#0F294A",
  },
  tonnageSection: {
    marginTop: 2,
  },
  tonnageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  fundasHint: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  tonsControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepBtn: {
    backgroundColor: "#E2E8F0",
    width: 44,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  tonsInput: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#0F294A",
    paddingVertical: 0,
  },
  unitSuffix: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
});