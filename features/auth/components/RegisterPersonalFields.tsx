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
  onLookupRnc?: () => void;
  isLookingUpRnc?: boolean;
  identificationType?: string;
  personType?: "fisica" | "juridica";
  onPersonTypeChange?: (type: "fisica" | "juridica") => void;
  registerMethod?: "email" | "phone";
}

export const RegisterPersonalFields: React.FC<RegisterPersonalFieldsProps> = ({
  control,
  errors,
  onLookupCedula,
  isLookingUpCedula,
  onLookupRnc,
  isLookingUpRnc,
  identificationType = "Cedula",
  personType = "fisica",
  onPersonTypeChange,
  registerMethod = "email",
}) => {
  return (
    <View>
      {/* Selector Persona Física vs Empresa */}
      <View style={styles.personTypeWrapper}>
        <Text style={styles.sectionLabel}>Modalidad de Registro</Text>
        <View style={styles.personTypeContainer}>
          <TouchableOpacity
            style={[
              styles.personTypeTab,
              personType === "fisica" && styles.personTypeTabActive,
            ]}
            onPress={() => onPersonTypeChange?.("fisica")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.personTypeText,
                personType === "fisica" && styles.personTypeTextActive,
              ]}
            >
              👤 Persona Física
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.personTypeTab,
              personType === "juridica" && styles.personTypeTabActive,
            ]}
            onPress={() => onPersonTypeChange?.("juridica")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.personTypeText,
                personType === "juridica" && styles.personTypeTextActive,
              ]}
            >
              🏢 Empresa (RNC)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Campos dinámicos si es Empresa */}
      {personType === "juridica" && (
        <View style={styles.companyCard}>
          <Text style={styles.companyCardTitle}>Datos de la Empresa</Text>
          <Controller
            control={control}
            name="companyRnc"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="RNC de la Empresa (9 u 11 dígitos)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.companyRnc && (
            <Text style={styles.error}>{errors.companyRnc.message}</Text>
          )}

          {onLookupRnc && (
            <TouchableOpacity
              style={styles.lookupButton}
              onPress={onLookupRnc}
              disabled={isLookingUpRnc}
              activeOpacity={0.7}
            >
              <Ionicons
                name="search-outline"
                size={16}
                color="#E31E24"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.lookupButtonText}>
                {isLookingUpRnc
                  ? "Consultando en DGII..."
                  : "Consultar RNC (DGII)"}
              </Text>
            </TouchableOpacity>
          )}

          <Controller
            control={control}
            name="companyName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Razón Social / Nombre Comercial"
                placeholderTextColor="#999"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.companyName && (
            <Text style={styles.error}>{errors.companyName.message}</Text>
          )}
        </View>
      )}
      {/* Documento personal (solo si es Persona Física) */}
      {personType !== "juridica" && (
        <>
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
        </>
      )}

      {registerMethod !== "phone" && (
        <>
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
        </>
      )}

      {/* Nombres y Apellidos (solo si es Persona Física) */}
      {personType !== "juridica" && (
        <>
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
        </>
      )}

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder={
              personType === "juridica"
                ? "Teléfono de contacto (Opcional)"
                : "Teléfono"
            }
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  personTypeWrapper: {
    marginBottom: 12,
  },
  personTypeContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  personTypeTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  personTypeTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  personTypeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
  },
  personTypeTextActive: {
    color: "#0F172A",
    fontWeight: "700",
  },
  companyCard: {
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  companyCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F294A",
    marginBottom: 8,
  },
});
