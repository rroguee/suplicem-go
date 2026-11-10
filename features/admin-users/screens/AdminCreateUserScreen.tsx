import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AddressPicker from "@/components/AddressPicker";
import CustomPickerModal from "@/components/CustomPickerModal";
import { ActionSuccessModal } from "@/components/common/ActionSuccessModal";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AdminUserVehicleFields } from "../components/AdminUserVehicleFields";
import { useAdminCreateUser } from "../hooks/useAdminCreateUser";

const ROLE_OPTIONS = [
  { label: "Cliente", value: "client" },
  { label: "Vendedor", value: "seller" },
  { label: "Conductor / Transportista", value: "driver" },
  { label: "Administrador", value: "admin" },
];

export const AdminCreateUserScreen: React.FC = () => {
  const router = useRouter();
  const {
    names,
    setNames,
    lastNames,
    setLastNames,
    email,
    setEmail,
    identification,
    setIdentification,
    phone,
    setPhone,
    userType,
    setUserType,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    setClientAddress,
    vehicle,
    updateVehicle,
    handleCreateUser,
    isSeller,
    showSuccessModal,
    setShowSuccessModal,
    successMessage,
    resetForm,
  } = useAdminCreateUser();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <ScreenHeader
        title={isSeller ? "Registrar Cliente" : "Crear Usuario"}
        showBack={true}
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else if (isSeller) {
            router.replace("/(protected)/(tabs)/(orders)");
          } else {
            router.replace("/(protected)/(tabs)/(settings)");
          }
        }}
        style={{ marginBottom: 16 }}
      />

      {!isSeller && (
        <CustomPickerModal
          label="Rol de Usuario a Crear"
          selectedValue={userType}
          onValueChange={(val) => setUserType(val as any)}
          options={ROLE_OPTIONS}
        />
      )}

      {!isSeller && userType === "admin" && (
        <View style={styles.adminNotice}>
          <Ionicons name="shield-checkmark" size={20} color="#D97706" />
          <Text style={styles.adminNoticeText}>
            Este usuario tendrá rol de Administrador activo con permisos totales para gestionar
            órdenes, usuarios, productos y viajes.
          </Text>
        </View>
      )}

      <Text style={styles.label}>Nombres</Text>
      <TextInput
        placeholder="Ej: Juan"
        placeholderTextColor="#999"
        value={names}
        onChangeText={setNames}
        style={styles.input}
      />

      <Text style={styles.label}>Apellidos</Text>
      <TextInput
        placeholder="Ej: Pérez"
        placeholderTextColor="#999"
        value={lastNames}
        onChangeText={setLastNames}
        style={styles.input}
      />

      <Text style={styles.label}>No. de Cédula (11 dígitos sin guiones)</Text>
      <TextInput
        placeholder="Ej: 40200000000"
        placeholderTextColor="#999"
        value={identification}
        onChangeText={setIdentification}
        keyboardType="numeric"
        maxLength={11}
        style={styles.input}
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        placeholder="Ej: 8095551234"
        placeholderTextColor="#999"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Text style={styles.label}>Correo Electrónico</Text>
      <TextInput
        placeholder="correo@ejemplo.com"
        placeholderTextColor="#999"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      {userType === "client" && (
        <View style={styles.sectionContainer}>
          <Text style={styles.label}>Dirección Inicial de Entrega (Opcional)</Text>
          <AddressPicker onPlaceSelected={(place) => setClientAddress(place)} />
        </View>
      )}

      {userType === "driver" && (
        <AdminUserVehicleFields vehicle={vehicle} onChangeVehicle={updateVehicle} />
      )}

      <TouchableOpacity style={styles.button} onPress={handleCreateUser}>
        <Text style={styles.buttonText}>
          {userType === "driver"
            ? "Crear Conductor en Servidor"
            : userType === "admin"
            ? "Crear Administrador en Servidor"
            : userType === "seller"
            ? "Crear Vendedor en Servidor"
            : "Crear Cliente en Servidor"}
        </Text>
      </TouchableOpacity>
      </ScrollView>

      {/* Tarjeta Modal de Confirmación de Éxito Reutilizable */}
      <ActionSuccessModal
        visible={showSuccessModal}
        title={isSeller ? "¡Cliente Registrado!" : "¡Usuario Registrado!"}
        message={successMessage}
        onClose={() => {
          setShowSuccessModal(false);
          resetForm();
          router.back();
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingBottom: 140,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#0F294A",
  },
  adminNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  adminNoticeText: {
    flex: 1,
    fontSize: 12.5,
    color: "#92400E",
    fontWeight: "500",
  },
  sectionContainer: {
    marginTop: 6,
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
    marginBottom: 14,
    color: "#000",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    marginBottom: 14,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    color: "#000",
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
