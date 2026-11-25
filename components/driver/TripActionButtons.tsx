import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CheckRender from "@/components/CheckRender";

type TripActionButtonsProps = {
  tripStatus: string;
  onAcceptTrip?: () => void;
  onStartTrip: () => void;
  onCompleteOrder: () => void;
  onCancel: () => void;
};

export const TripActionButtons: React.FC<TripActionButtonsProps> = ({
  tripStatus,
  onAcceptTrip,
  onStartTrip,
  onCompleteOrder,
  onCancel,
}) => {
  const canAccept =
    tripStatus !== "accepted" &&
    tripStatus !== "started" &&
    tripStatus !== "in_progress" &&
    tripStatus !== "completed" &&
    tripStatus !== "canceled";

  return (
    <View style={styles.actions}>
      <CheckRender allowed={canAccept}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onAcceptTrip || onStartTrip}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Aceptar viaje</Text>
        </TouchableOpacity>
      </CheckRender>

      <CheckRender allowed={tripStatus === "accepted"}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onStartTrip}
          activeOpacity={0.85}
        >
          <Ionicons name="play" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Iniciar viaje</Text>
        </TouchableOpacity>
      </CheckRender>

      <CheckRender allowed={tripStatus === "started" || tripStatus === "in_progress"}>
        <TouchableOpacity
          style={[styles.primaryButton, styles.completeButton]}
          onPress={onCompleteOrder}
          activeOpacity={0.85}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Completar entrega con PIN</Text>
        </TouchableOpacity>
      </CheckRender>

      <CheckRender
        allowed={tripStatus !== "completed" && tripStatus !== "canceled"}
      >
        <TouchableOpacity
          style={styles.cancelOutlineButton}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
          <Text style={styles.cancelOutlineText}>Cancelar viaje</Text>
        </TouchableOpacity>
      </CheckRender>
    </View>
  );
};

export default TripActionButtons;

const styles = StyleSheet.create({
  actions: {
    marginTop: 20,
    gap: 10,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0284C7",
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  completeButton: {
    backgroundColor: "#16A34A",
    shadowColor: "#16A34A",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelOutlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 11,
    borderRadius: 10,
  },
  cancelOutlineText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 14,
  },
});
