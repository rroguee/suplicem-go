import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import CustomPickerModal from "@/components/CustomPickerModal";
import { DRIVER_VEHICLE_TON_OPTIONS } from "@/constants/cartConstants";
import {
  getVehicleBrandOptions,
  getVehicleModelOptions,
} from "@/constants/vehicleBrands";

export interface VehicleData {
  brand: string;
  model: string;
  year: string;
  tons: string;
  plateNumber: string;
}

interface AdminUserVehicleFieldsProps {
  vehicle: VehicleData;
  onChangeVehicle: (updated: Partial<VehicleData>) => void;
}

const YEAR_OPTIONS = Array.from({ length: 36 }, (_, i) => {
  const y = String(1990 + i);
  return { label: y, value: y };
}).reverse();

export const AdminUserVehicleFields: React.FC<AdminUserVehicleFieldsProps> = ({
  vehicle,
  onChangeVehicle,
}) => {
  const currentModels = getVehicleModelOptions(vehicle.brand);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Datos del Vehículo de Transporte</Text>
      <Text style={styles.sectionSubtitle}>
        Configura los datos del camión o vehículo asignado a este conductor.
      </Text>

      <CustomPickerModal
        label="Marca"
        selectedValue={vehicle.brand}
        onValueChange={(selectedBrand) => {
          onChangeVehicle({ brand: selectedBrand, model: "" });
        }}
        options={getVehicleBrandOptions()}
        searchable
        searchPlaceholder="Buscar marca de camión..."
      />

      <CustomPickerModal
        label="Modelo"
        selectedValue={vehicle.model}
        onValueChange={(selectedModel) => onChangeVehicle({ model: selectedModel })}
        options={currentModels}
      />

      <CustomPickerModal
        label="Año del Vehículo"
        selectedValue={vehicle.year}
        onValueChange={(selectedYear) => onChangeVehicle({ year: selectedYear })}
        options={YEAR_OPTIONS}
      />

      <CustomPickerModal
        label="Capacidad de Carga (Toneladas)"
        selectedValue={vehicle.tons}
        onValueChange={(selectedTons) => onChangeVehicle({ tons: selectedTons })}
        options={DRIVER_VEHICLE_TON_OPTIONS}
      />

      <Text style={styles.label}>Número de Placa</Text>
      <TextInput
        placeholder="Ej: L123456"
        placeholderTextColor="#999"
        value={vehicle.plateNumber}
        onChangeText={(text) => onChangeVehicle({ plateNumber: text.toUpperCase() })}
        autoCapitalize="characters"
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 14,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F294A",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F294A",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 14,
    height: 48,
    color: "#000",
    marginBottom: 8,
  },
});
