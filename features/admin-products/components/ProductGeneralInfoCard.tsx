import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { formatNumberWithCommas } from "@/utils/currencyUtils";

interface Props {
  name: string;
  onChangeName: (val: string) => void;
  price: string;
  onChangePrice: (val: string) => void;
  unit: string;
  onChangeUnit: (val: string) => void;
  weightKg: string;
  onChangeWeightKg: (val: string) => void;
}

export const ProductGeneralInfoCard: React.FC<Props> = ({
  name,
  onChangeName,
  price,
  onChangePrice,
  unit,
  onChangeUnit,
  weightKg,
  onChangeWeightKg,
}) => (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>Datos Generales</Text>
    <Text style={styles.label}>Nombre del Producto</Text>
    <TextInput
      style={styles.input}
      value={name}
      onChangeText={onChangeName}
      placeholder="Ej. Cemento Titán (42.5 kg)"
      placeholderTextColor="#94A3B8"
    />
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Precio Unitario (RD$)</Text>
        <TextInput
          style={[styles.input, { fontWeight: "bold" }]}
          value={price}
          onChangeText={(t) => onChangePrice(formatNumberWithCommas(t))}
          placeholder="Ej. 510.00"
          keyboardType="numeric"
          placeholderTextColor="#94A3B8"
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Unidad</Text>
        <TextInput
          style={styles.input}
          value={unit}
          onChangeText={onChangeUnit}
          placeholder="fundas"
          placeholderTextColor="#94A3B8"
        />
      </View>
    </View>
    <Text style={styles.label}>Peso por unidad (kg)</Text>
    <TextInput
      style={styles.input}
      value={weightKg}
      onChangeText={onChangeWeightKg}
      placeholder="42.5"
      keyboardType="numeric"
      placeholderTextColor="#94A3B8"
    />
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", textTransform: "uppercase", color: "#64748B", marginBottom: 10 },
  label: { fontSize: 12, fontWeight: "600", color: "#334155", marginBottom: 6, marginTop: 4 },
  input: { height: 44, borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, paddingHorizontal: 12, fontSize: 14, backgroundColor: "#F8FAFC", color: "#0F294A", marginBottom: 10 },
  row: { flexDirection: "row", gap: 12 },
});
