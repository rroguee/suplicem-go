import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AddressPicker from "@/components/AddressPicker";
import { Palette } from "@/constants/theme";
import { Address } from "@/types/users";

interface Props {
  addresses: Address[];
  onAddAddress: () => void;
  onRemoveAddress: (index: number) => void;
  onUpdatePlace: (index: number, place: any) => void;
  onUpdateInfo: (index: number, text: string) => void;
}

export const AdminUserAddressesFields: React.FC<Props> = ({
  addresses,
  onAddAddress,
  onRemoveAddress,
  onUpdatePlace,
  onUpdateInfo,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>Direcciones de Entrega (Opcional)</Text>
        <TouchableOpacity onPress={onAddAddress} style={styles.addBtn}>
          <Ionicons name="add-circle-outline" size={16} color={Palette.primary} />
          <Text style={styles.addBtnText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {addresses.length === 0 ? (
        <TouchableOpacity onPress={onAddAddress} style={styles.emptyCard}>
          <Ionicons name="location-outline" size={22} color="#94A3B8" />
          <Text style={styles.emptyText}>Sin direcciones asignadas</Text>
          <Text style={styles.emptySubText}>Toca aquí para agregar una dirección inicial</Text>
        </TouchableOpacity>
      ) : (
        addresses.map((addr, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIndex}>Dirección #{idx + 1}</Text>
              <TouchableOpacity onPress={() => onRemoveAddress(idx)}>
                <Text style={styles.deleteText}>Eliminar</Text>
              </TouchableOpacity>
            </View>

            <AddressPicker
              initialValue={addr.description}
              onPlaceSelected={(place) => onUpdatePlace(idx, place)}
            />

            <TextInput
              style={styles.inputInfo}
              placeholder="Información adicional (ej: Apto. 402, frente a Supermercado)"
              placeholderTextColor="#999"
              value={addr.additionalInfo || ""}
              onChangeText={(text) => onUpdateInfo(idx, text)}
            />
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#334155",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addBtnText: {
    color: Palette.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 4,
  },
  emptySubText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardIndex: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#475569",
  },
  deleteText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
  inputInfo: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: "#1E293B",
    marginTop: 8,
  },
});
