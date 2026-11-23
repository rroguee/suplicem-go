import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/types/users";
import { PlannedTripItem } from "./OrderTripPlannerModal";
import { styles } from "../styles/orderTripPlannerModal.styles";

interface TripPlannerItemCardProps {
  index: number;
  item: PlannedTripItem;
  isAllCement: boolean;
  tonsToBags: (t: number) => number;
  assignedDriver?: User;
  onUpdateTons: (index: number, val: string) => void;
  onOpenDriverPicker: (index: number) => void;
}

export const TripPlannerItemCard: React.FC<TripPlannerItemCardProps> = ({
  index,
  item,
  isAllCement,
  tonsToBags,
  assignedDriver,
  onUpdateTons,
  onOpenDriverPicker,
}) => {
  const driverCap = Number(assignedDriver?.vehicle?.tons) || 0;
  const isOverCap = driverCap > 0 && item.totalTons > driverCap;

  return (
    <View style={styles.tripCard}>
      <View style={styles.tripCardHeader}>
        <Text style={styles.tripCardTitle}>Viaje #{index + 1}</Text>
        {isAllCement && (
          <Text style={styles.tripBagsText}>
            ~{tonsToBags(item.totalTons).toLocaleString()} fundas
          </Text>
        )}
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.fieldLabel}>Toneladas:</Text>
        <TextInput
          style={styles.tonInput}
          keyboardType="numeric"
          value={item.totalTons.toString()}
          onChangeText={(val) => onUpdateTons(index, val)}
        />
        <Text style={styles.unitSuffix}>t</Text>
      </View>

      <TouchableOpacity
        style={styles.driverBtn}
        onPress={() => onOpenDriverPicker(index)}
        activeOpacity={0.7}
      >
        <Ionicons name="person-outline" size={16} color="#0F294A" />
        <Text style={styles.driverBtnText} numberOfLines={1}>
          {assignedDriver
            ? `[${assignedDriver.driverCode || "COND"}] ${assignedDriver.names} ${assignedDriver.lastNames} (${driverCap} t)`
            : "Seleccionar Conductor"}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#64748B" />
      </TouchableOpacity>

      {isOverCap && (
        <Text style={styles.warnText}>
          ⚠️ La carga supera la capacidad del camión ({driverCap} t).
        </Text>
      )}
    </View>
  );
};
