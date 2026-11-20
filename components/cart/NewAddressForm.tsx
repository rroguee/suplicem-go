import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AddressPicker from "@/components/AddressPicker";
import { Palette } from "@/constants/theme";

interface NewAddressFormProps {
  hasSavedAddresses: boolean;
  customAddressText: string;
  onChangeCustomAddressText: (text: string) => void;
  customAdditionalInfo: string;
  onChangeCustomAdditionalInfo: (text: string) => void;
  onCustomPlaceSelected: (place: any) => void;
  saveAddressToProfile: boolean;
  onToggleSaveAddress: (save: boolean) => void;
}

export const NewAddressForm: React.FC<NewAddressFormProps> = ({
  hasSavedAddresses,
  customAddressText,
  customAdditionalInfo,
  onChangeCustomAdditionalInfo,
  onCustomPlaceSelected,
  saveAddressToProfile,
  onToggleSaveAddress,
}) => {
  return (
    <View style={styles.newAddressContainer}>
      {!hasSavedAddresses && (
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#2563EB" />
          <Text style={styles.infoBannerText}>
            No tienes direcciones guardadas en tu perfil. Ingresa la dirección donde deseas recibir el pedido:
          </Text>
        </View>
      )}

      <Text style={styles.fieldLabel}>Buscar o escribir dirección:</Text>
      <AddressPicker
        initialValue={customAddressText}
        onPlaceSelected={onCustomPlaceSelected}
      />

      <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
        Detalles adicionales / Referencia (Opcional):
      </Text>
      <TextInput
        style={styles.textInput}
        value={customAdditionalInfo}
        onChangeText={onChangeCustomAdditionalInfo}
        placeholder="Ej. Frente a la plaza, Apto 2B, portón negro..."
        placeholderTextColor={Palette.placeholder}
      />

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => onToggleSaveAddress(!saveAddressToProfile)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={saveAddressToProfile ? "checkbox" : "square-outline"}
          size={22}
          color={saveAddressToProfile ? Palette.primary : "#94A3B8"}
        />
        <Text style={styles.checkboxLabel}>
          Guardar esta dirección en mi cuenta para próximos pedidos
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default NewAddressForm;

const styles = StyleSheet.create({
  newAddressContainer: {
    marginTop: 4,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoBannerText: {
    fontSize: 12,
    color: "#1E40AF",
    flex: 1,
    lineHeight: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: "#1E293B",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#334155",
    flex: 1,
  },
});
