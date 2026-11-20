import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Control, Controller, FieldErrors, UseFormSetValue } from "react-hook-form";
import AddressPicker from "@/components/AddressPicker";
import { Address, RegisterFormData } from "@/types/users";

interface RegisterAddressSectionProps {
  control: Control<RegisterFormData>;
  addresses: Address[];
  setValue: UseFormSetValue<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  onAddAddress: () => void;
  onRemoveAddress: (index: number) => void;
}

export const RegisterAddressSection: React.FC<RegisterAddressSectionProps> = ({
  control,
  addresses,
  setValue,
  errors,
  onAddAddress,
  onRemoveAddress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Direcciones</Text>
      {errors.addresses && !Array.isArray(errors.addresses) && (
        <Text style={styles.error}>{(errors.addresses as any)?.message}</Text>
      )}

      {addresses.map((addr, index) => (
        <View key={index} style={styles.addressItem}>
          <Text style={styles.addressLabel}>
            {addr?.description || "Selecciona una dirección"}
          </Text>
          <Text style={styles.addressSubLabel}>
            Referencias: {addr?.additionalInfo || ""}
          </Text>
          <AddressPicker
            initialValue={addr?.description || ""}
            onPlaceSelected={(place) => {
              const updated = [...addresses];
              updated[index] = { ...updated[index], ...place };
              setValue("addresses", updated);
            }}
          />

          <Controller
            control={control}
            name={`addresses.${index}.additionalInfo`}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Información adicional (ej: Apto. 402, frente a Supermercado)"
                placeholderTextColor="#999"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          {errors.addresses?.[index]?.description && (
            <Text style={styles.error}>
              {errors.addresses[index]?.description?.message}
            </Text>
          )}

          {addresses.length > 1 && (
            <TouchableOpacity onPress={() => onRemoveAddress(index)}>
              <Text style={styles.deleteLink}>Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity onPress={onAddAddress} style={styles.addBtn}>
        <Text style={styles.link}>+ Agregar dirección</Text>
      </TouchableOpacity>
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
  addressItem: {
    marginBottom: 10,
  },
  addressLabel: {
    marginBottom: 4,
    fontWeight: "500",
  },
  addressSubLabel: {
    marginBottom: 4,
    fontWeight: "500",
    color: "#64748B",
    fontSize: 12,
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
  link: {
    color: "#007BFF",
    marginBottom: 8,
    fontWeight: "600",
  },
  deleteLink: {
    color: "#DC2626",
    marginBottom: 8,
    fontWeight: "600",
  },
  addBtn: {
    marginTop: 4,
  },
});
