import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import CustomPickerModal from "@/components/CustomPickerModal";
import { RegisterFormData } from "@/types/users";

interface RegisterPersonalFieldsProps {
  control: Control<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  onLookupCedula?: () => void;
  isLookingUpCedula?: boolean;
  identificationType?: string;
}

export const RegisterPersonalFields: React.FC<RegisterPersonalFieldsProps> = ({
  control,
  errors,
  onLookupCedula,
  isLookingUpCedula,
  identificationType = "Cedula",
}) => {
  return (
    <View>
      <Controller
        control={control}
        name="identificationType"
        render={({ field: { value, onChange } }) => (
          <CustomPickerModal
            label="Tipo de documento"
            selectedValue={value}
            onValueChange={onChange}
            options={[
              { label: "Cédula", value: "Cedula" },
              { label: "Pasaporte", value: "Pasaporte" },
            ]}
          />
        )}
      />

      <Controller
        control={control}
        name="identification"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="No. de identificación"
            placeholderTextColor="#999"
            value={value}
            onChangeText={onChange}
            keyboardType="default"
          />
        )}
      />
      {errors.identification && (
        <Text style={styles.error}>{errors.identification.message}</Text>
      )}

      {identificationType === "Cedula" && onLookupCedula && (
        <TouchableOpacity
          style={styles.lookupButton}
          onPress={onLookupCedula}
          disabled={isLookingUpCedula}
          activeOpacity={0.7}
        >
          <Ionicons
            name="search-outline"
            size={16}
            color="#E31E24"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.lookupButtonText}>
            {isLookingUpCedula ? "Consultando en JCE..." : "Consultar Cédula (JCE)"}
          </Text>
        </TouchableOpacity>
      )}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.confirmPassword && (
        <Text style={styles.error}>{errors.confirmPassword.message}</Text>
      )}

      <Controller
        control={control}
        name="names"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Nombres"
            placeholderTextColor="#999"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.names && <Text style={styles.error}>{errors.names.message}</Text>}

      <Controller
        control={control}
        name="lastNames"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Apellidos"
            placeholderTextColor="#999"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.lastNames && <Text style={styles.error}>{errors.lastNames.message}</Text>}

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
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
  lookupButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  lookupButtonText: {
    color: "#E31E24",
    fontSize: 13,
    fontWeight: "bold",
  },
});
