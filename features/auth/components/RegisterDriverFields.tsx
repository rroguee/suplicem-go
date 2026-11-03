import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Control, Controller, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import CustomPickerModal from "@/components/CustomPickerModal";
import { RegisterFormData } from "@/types/users";
import { DRIVER_VEHICLE_TON_OPTIONS } from "@/constants/cartConstants";
import {
  getVehicleBrandOptions,
  getVehicleModelOptions,
} from "@/constants/vehicleBrands";

interface RegisterDriverFieldsProps {
  control: Control<RegisterFormData>;
  watch: UseFormWatch<RegisterFormData>;
  setValue: UseFormSetValue<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

export const RegisterDriverFields: React.FC<RegisterDriverFieldsProps> = ({
  control,
  watch,
  setValue,
  errors,
}) => {
  const brand = watch("vehicle.brand") || "";

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Datos del vehículo</Text>

      {/* Marca */}
      <Controller
        control={control}
        name="vehicle.brand"
        render={({ field: { onChange, value } }) => (
          <CustomPickerModal
            label="Marca"
            selectedValue={value || ""}
            onValueChange={(selectedBrand) => {
              onChange(selectedBrand);
              setValue("vehicle.model", "");
            }}
            options={getVehicleBrandOptions()}
            searchable
            searchPlaceholder="Buscar marca de camión..."
          />
        )}
      />

      {/* Modelo */}
      <Controller
        control={control}
        name="vehicle.model"
        render={({ field: { onChange, value } }) => (
          <CustomPickerModal
            label="Modelo"
            selectedValue={value || ""}
            onValueChange={onChange}
            options={getVehicleModelOptions(brand)}
          />
        )}
      />

      {/* Año */}
      <Controller
        control={control}
        name="vehicle.year"
        render={({ field: { value, onChange } }) => (
          <CustomPickerModal
            label="Año"
            selectedValue={value || ""}
            onValueChange={onChange}
            options={Array.from({ length: 35 }, (_, i) => {
              const year = `${1990 + i}`;
              return { label: year, value: year };
            })}
          />
        )}
      />

      {/* Placa */}
      <Controller
        control={control}
        name="vehicle.plateNumber"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Número de placa"
            placeholderTextColor="#999"
            value={value}
            onChangeText={onChange}
            autoCapitalize="characters"
          />
        )}
      />

      {/* Toneladas */}
      <Controller
        control={control}
        name="vehicle.tons"
        render={({ field: { value, onChange } }) => (
          <CustomPickerModal
            label="Toneladas"
            selectedValue={value || ""}
            onValueChange={onChange}
            options={DRIVER_VEHICLE_TON_OPTIONS}
          />
        )}
      />

      {errors.vehicle?.plateNumber && (
        <Text style={styles.error}>{errors.vehicle.plateNumber.message}</Text>
      )}

      {errors.vehicle && typeof errors.vehicle === "object" && (
        <>
          {Object.entries(errors.vehicle).map(([key, err]) => (
            <Text key={key} style={styles.error}>
              {(err as any)?.message}
            </Text>
          ))}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#0F294A",
  },
  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    color: "#000",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
});
