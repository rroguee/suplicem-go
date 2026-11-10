import React, { useContext, useState } from "react";
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
import { updateClientProfile } from "@/services/userService";
import { Address } from "@/types/users";
import ConfirmationModal from "@/components/ConfirmationModal";
import { ProfileAddressesCard } from "@/components/profile/ProfileAddressesCard";
import { LegalSectionCard } from "@/components/profile/LegalSectionCard";
import { TermsAndConditionsModal } from "@/components/profile/TermsAndConditionsModal";
import {
  SettingsProfileCard,
  SettingsLogoutButton,
  SettingsInfoRow,
} from "@/components/settings";
import { Palette } from "@/constants/theme";

const ClientSettingsMainScreen: React.FC = () => {
  const { user, logOut, logIn } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { show, hide } = useLoading();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [phone, setPhone] = useState(user?.phone || "");
  const [addresses, setAddresses] = useState<Address[]>(user?.addresses || []);
  const [prevUserId, setPrevUserId] = useState<string | null>(user?.uid || null);

  if (user?.uid && user.uid !== prevUserId) {
    setPrevUserId(user.uid);
    setPhone(user.phone || "");
    setAddresses(user.addresses || []);
  }

  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalVisible(false);
    logOut();
  };

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
        await updateClientProfile(user.uid, phone, addresses);

        const newUser = {
          ...user,
          phone,
          addresses,
        };

        logIn(newUser);
        showAlert({
          message: "¡Perfil y direcciones actualizadas con éxito!",
          type: "success",
        });
        setIsEditing(false);
      } catch (error) {
        console.error("Error al actualizar el cliente:", error);
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
      setAddresses(user.addresses || []);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Cargando datos del cliente...</Text>
      </View>
    );
  }

  const fullName = `${user.names} ${user.lastNames}`.trim() || "Cliente Registrado";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Mi Cuenta</Text>

      {/* Perfil del Cliente */}
      <SettingsProfileCard
        name={fullName}
        email={user?.email}
        phone={user?.phone}
        badgeText={user.status === "active" ? "Cliente Activo" : "Cliente Registrado"}
        badgeIcon="person"
        badgeColor="#0369A1"
        badgeBgColor="#E0F2FE"
        badgeBorderColor="#BAE6FD"
        avatarIcon="person"
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

      {/* Direcciones Registradas */}
      <ProfileAddressesCard
        isEditing={isEditing}
        addresses={addresses}
        setAddresses={setAddresses}
        userAddresses={user.addresses}
      />

      {/* Sección Legal */}
      <LegalSectionCard onOpenTerms={() => setIsTermsModalVisible(true)} />

      {/* Botones de Acción */}
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
            <Text style={styles.editToggleText}>Editar Perfil y Direcciones</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cerrar Sesión */}
      {!isEditing && <SettingsLogoutButton onPress={handleLogout} />}

      <TermsAndConditionsModal
        visible={isTermsModalVisible}
        onClose={() => setIsTermsModalVisible(false)}
      />

      <ConfirmationModal
        visible={isLogoutModalVisible}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutModalVisible(false)}
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
      />
    </ScrollView>
  );
};

export default ClientSettingsMainScreen;

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
