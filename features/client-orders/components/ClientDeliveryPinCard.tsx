import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ClientDeliveryPinCardProps {
  pin?: string;
  tripStatus?: string;
}

export const ClientDeliveryPinCard: React.FC<ClientDeliveryPinCardProps> = ({
  pin,
  tripStatus,
}) => {
  if (tripStatus === "completed" || tripStatus === "canceled") {
    return null;
  }

  // Si el viaje no tiene PIN asignado aún (ej. viaje creado previamente)
  if (!pin) {
    if (tripStatus !== "started" && tripStatus !== "in_progress") {
      return null;
    }
    return (
      <View style={[styles.card, { backgroundColor: "#FFFBEB", borderColor: "#FCD34D" }]}>
        <View style={styles.header}>
          <Ionicons name="information-circle-outline" size={24} color="#D97706" />
          <Text style={[styles.title, { color: "#B45309" }]}>Entrega en Curso</Text>
        </View>
        <Text style={[styles.instruction, { color: "#92400E", marginBottom: 0 }]}>
          Tu pedido está en camino. El conductor o administrador confirmará la entrega al llegar a tu destino.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={24} color="#16A34A" />
        <Text style={styles.title}>Código de Confirmación de Entrega</Text>
      </View>
      <Text style={styles.instruction}>
        Entrega este código al conductor únicamente cuando hayas recibido y verificado tu carga:
      </Text>
      <View style={styles.pinContainer}>
        <Text style={styles.pinText}>{pin}</Text>
      </View>
      <View style={styles.noteContainer}>
        <Ionicons name="lock-closed" size={13} color="#166534" style={{ marginTop: 1 }} />
        <Text style={styles.note}>
          Este código garantiza que el pedido solo se complete en tu presencia.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    borderRadius: 14,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#166534",
  },
  instruction: {
    fontSize: 13,
    color: "#15803D",
    marginBottom: 12,
    lineHeight: 18,
  },
  pinContainer: {
    backgroundColor: "#ffffff",
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 10,
  },
  pinText: {
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 10,
    color: "#0F294A",
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  note: {
    fontSize: 11,
    color: "#166534",
    textAlign: "center",
  },
});
