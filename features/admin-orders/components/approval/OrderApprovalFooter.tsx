import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  totalOrderTons: number;
  totalPlannedTons: number;
  onConfirm: () => void;
  saving?: boolean;
  isPickup?: boolean;
}

export const OrderApprovalFooter: React.FC<Props> = ({
  totalOrderTons,
  totalPlannedTons,
  onConfirm,
  saving = false,
  isPickup = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Total Orden:</Text>
        <Text style={styles.summaryVal}>{totalOrderTons.toFixed(2)} t</Text>
      </View>
      {!isPickup && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Planificado en Camiones:</Text>
          <Text style={[styles.summaryVal, { color: "#166534" }]}>
            {totalPlannedTons.toFixed(2)} t
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.confirmButton, saving && { opacity: 0.6 }]}
        onPress={onConfirm}
        disabled={saving}
        activeOpacity={0.8}
      >
        <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
        <Text style={styles.confirmButtonText}>
          {saving
            ? "Procesando Aprobación..."
            : isPickup
            ? "Confirmar Aprobación (Retiro en Almacén)"
            : "Confirmar Aprobación y Generar Viajes"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  summaryVal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 12,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
