import React, { startTransition, useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/context/authContext";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { updateDriverProfile } from "@/services/userService";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  SettingsProfileCard,
  SettingsMenuCard,
  SettingsMenuRow,
  SettingsLogoutButton,
  SettingsInfoRow,
  SupportContactModal,
} from "@/components/settings";
import { AdminUserVehicleFields } from "@/features/admin-users/components/AdminUserVehicleFields";
import { DRIVER_VEHICLE_TON_OPTIONS } from "@/constants/cartConstants";
import { Palette } from "@/constants/theme";

const DriverSettingsMainScreen: React.FC = () => {
  const { user, logOut, logIn } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { show, hide } = useLoading();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isSupportModalVisible, setIsSupportModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [phone, setPhone] = useState(user?.phone || "");
  const [vehicleBrand, setVehicleBrand] = useState(user?.vehicle?.brand || "");
  const [vehicleModel, setVehicleModel] = useState(user?.vehicle?.model || "");
  const [vehicleYear, setVehicleYear] = useState(user?.vehicle?.year || "");
  const [vehicleTons, setVehicleTons] = useState(user?.vehicle?.tons || "");
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState(user?.vehicle?.plateNumber || "");

  useEffect(() => {
    if (user) {
      startTransition(() => {
        setPhone(user.phone || "");
        setVehicleBrand(user.vehicle?.brand || "");
        setVehicleModel(user.vehicle?.model || "");
        setVehicleYear(user.vehicle?.year || "");
        setVehicleTons(user.vehicle?.tons || "");
        setVehiclePlateNumber(user.vehicle?.plateNumber || "");
      });
    }
  }, [user]);

  const fullName = `${user?.names || ""} ${user?.lastNames || ""}`.trim() || "Conductor Oficial";
  const driverCode =
    (user as any)?.driverCode ||
    (user?.uid ? `COND-${user.uid.slice(0, 5).toUpperCase()}` : "COND-OFICIAL");

  const handleEdit = async () => {
    if (isEditing) {
      if (!user) {
        showAlert({
          message: "No se puede guardar, el usuario no está disponible.",
          type: "error",
        });
        return;
      }
      try {
        show();
        await updateDriverProfile(
          user.uid,
          phone,
          vehicleBrand,
          vehicleModel,
          vehicleYear,
          vehicleTons,
          vehiclePlateNumber
        );

        const newUser = {
          ...user,
          phone,
          vehicle: {
            ...(user.vehicle || {}),
            brand: vehicleBrand,
            model: vehicleModel,
            year: vehicleYear,
            tons: vehicleTons,
            plateNumber: vehiclePlateNumber,
          },
        };

        logIn(newUser);
        showAlert({
          message: "¡Perfil y datos del vehículo actualizados con éxito!",
          type: "success",
        });
        setIsEditing(false);
      } catch (error) {
        console.error("Error en actualización del conductor:", error);
        showAlert({
          message: "No se pudo actualizar el perfil. Inténtelo de nuevo.",
          type: "error",
        });
      } finally {
        hide();
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setPhone(user.phone || "");
      setVehicleBrand(user.vehicle?.brand || "");
      setVehicleModel(user.vehicle?.model || "");
      setVehicleYear(user.vehicle?.year || "");
      setVehicleTons(user.vehicle?.tons || "");
      setVehiclePlateNumber(user.vehicle?.plateNumber || "");
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Panel de Conductor</Text>

      {/* Perfil del Conductor */}
      <SettingsProfileCard
        name={fullName}
        email={user?.email}
        phone={user?.phone}
        badgeText={`Credencial: ${driverCode}`}
        badgeIcon="bus"
        badgeColor="#0F294A"
        badgeBgColor="#E2E8F0"
        badgeBorderColor="#CBD5E1"
        avatarIcon="bus"
      />

      {/* Información Personal */}
      <Text style={styles.sectionTitle}>Datos Personales</Text>
      <View style={styles.card}>
        <SettingsInfoRow
          label="Identificación"
          value={`${user.identificationType || "Cédula"}: ${user.identification || "N/A"}`}
          icon={<Ionicons name="card-outline" size={18} color="#0F294A" />}
        />
        <View style={styles.divider} />
        <SettingsInfoRow
          label="Correo Electrónico"
          value={user.email || "N/A"}
          icon={<Ionicons name="mail-outline" size={18} color="#0F294A" />}
        />
        <View style={styles.divider} />
        <SettingsInfoRow
          label="Teléfono Móvil"
          value={phone}
          icon={<Ionicons name="call-outline" size={18} color="#0F294A" />}
          isEditing={isEditing}
          onChangeText={setPhone}
          placeholder="Ej: 8095551234"
          keyboardType="phone-pad"
        />
      </View>

      {/* Vehículo Asignado */}
      <Text style={styles.sectionTitle}>Vehículo de Carga</Text>
      {isEditing ? (
        <AdminUserVehicleFields
          vehicle={{
            brand: vehicleBrand,
            model: vehicleModel,
            year: vehicleYear,
            tons: vehicleTons,
            plateNumber: vehiclePlateNumber,
          }}
          onChangeVehicle={(updated) => {
            if (updated.brand !== undefined) {
              setVehicleBrand(updated.brand);
              setVehicleModel("");
            }
            if (updated.model !== undefined) setVehicleModel(updated.model);
            if (updated.year !== undefined) setVehicleYear(updated.year);
            if (updated.tons !== undefined) setVehicleTons(updated.tons);
            if (updated.plateNumber !== undefined) setVehiclePlateNumber(updated.plateNumber);
          }}
        />
      ) : (
        <View style={styles.card}>
          <View style={styles.plateHeaderBox}>
            <Ionicons name="car-sport" size={20} color="#0F294A" />
            <View style={{ flex: 1 }}>
              <Text style={styles.plateHeaderLabel}>PLACA VEHICULAR</Text>
              <Text style={styles.plateHeaderValue}>
                {vehiclePlateNumber ? vehiclePlateNumber.toUpperCase() : "NO ASIGNADA"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />
          <SettingsInfoRow
            label="Marca"
            value={vehicleBrand || "No registrada"}
            icon={<Ionicons name="car-outline" size={18} color="#0F294A" />}
          />
          <View style={styles.divider} />
          <SettingsInfoRow
            label="Modelo"
            value={vehicleModel || "No registrado"}
            icon={<Ionicons name="speedometer-outline" size={18} color="#0F294A" />}
          />
          <View style={styles.divider} />
          <SettingsInfoRow
            label="Año"
            value={vehicleYear ? String(vehicleYear) : "No registrado"}
            icon={<Ionicons name="calendar-outline" size={18} color="#0F294A" />}
          />
          <View style={styles.divider} />
          <SettingsInfoRow
            label="Capacidad de Carga"
            value={
              DRIVER_VEHICLE_TON_OPTIONS.find((opt) => opt.value === vehicleTons)?.label ||
              (vehicleTons ? `${vehicleTons} Toneladas` : "No registrada")
            }
            icon={<Ionicons name="cube-outline" size={18} color="#0F294A" />}
          />
        </View>
      )}

      {/* Botones de Edición */}
      <View style={styles.actionButtonsContainer}>
        {isEditing ? (
          <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.saveBtn]}
              onPress={handleEdit}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editToggleBtn}
            onPress={() => setIsEditing(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={18} color={Palette.primary} />
            <Text style={styles.editToggleText}>Editar Datos y Vehículo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Soporte y Asistencia */}
      {!isEditing && (
        <SettingsMenuCard>
          <SettingsMenuRow
            icon="headset-outline"
            iconColor="#166534"
            iconBgColor="#DCFCE7"
            title="Soporte y Asistencia"
            subtitle="Canales de contacto y horarios"
            onPress={() => setIsSupportModalVisible(true)}
          />
        </SettingsMenuCard>
      )}

      {/* Cerrar Sesión */}
      {!isEditing && (
        <SettingsLogoutButton onPress={() => setIsLogoutModalVisible(true)} />
      )}

      <SupportContactModal
        visible={isSupportModalVisible}
        onClose={() => setIsSupportModalVisible(false)}
      />

      <ConfirmationModal
        visible={isLogoutModalVisible}
        title="Cerrar sesión"
        message="¿Estás seguro que deseas cerrar tu sesión de conductor?"
        onConfirm={() => {
          setIsLogoutModalVisible(false);
          logOut();
        }}
        onCancel={() => setIsLogoutModalVisible(false)}
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
      />
    </ScrollView>
  );
};

export default DriverSettingsMainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 10,
    marginTop: 6,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 64,
  },
  plateHeaderBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F1F5F9",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  plateHeaderLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  plateHeaderValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
    marginTop: 1,
  },
  actionButtonsContainer: {
    marginVertical: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  saveBtn: {
    backgroundColor: Palette.primary,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  editToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  editToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: Palette.primary,
  },
});
