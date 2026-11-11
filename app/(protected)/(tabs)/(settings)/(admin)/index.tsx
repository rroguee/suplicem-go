import React, { useContext, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "@/context/authContext";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  SettingsProfileCard,
  SettingsMenuCard,
  SettingsMenuRow,
  SettingsLogoutButton,
  EditAccountModal,
} from "@/components/settings";

const AdminSettingsMainScreen: React.FC = () => {
  const router = useRouter();
  const { user, logOut, updateUser } = useContext(AuthContext);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const fullName = `${user?.names || ""} ${user?.lastNames || ""}`.trim() || "Administrador";

  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalVisible(false);
    logOut();
  };

  const cancelLogout = () => {
    setIsLogoutModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Panel de Administración</Text>

      {/* Perfil del Administrador */}
      <SettingsProfileCard
        name={fullName}
        email={user?.email}
        phone={user?.phone}
        badgeText="Administrador del Sistema"
        badgeIcon="shield-checkmark"
        badgeColor="#166534"
        badgeBgColor="#DCFCE7"
        badgeBorderColor="#BBF7D0"
        avatarIcon="shield-checkmark"
      />

      {/* Menú de Gestión y Operaciones */}
      <SettingsMenuCard title="Gestión y Operaciones">
        <SettingsMenuRow
          icon="person-circle-outline"
          iconColor="#0F294A"
          iconBgColor="#E2E8F0"
          title="Editar Mi Cuenta"
          subtitle="Actualiza tu nombre, apellido y teléfono"
          onPress={() => setIsEditModalVisible(true)}
        />
        <SettingsMenuRow
          icon="shield-checkmark-outline"
          iconColor="#991B1B"
          iconBgColor="#FEE2E2"
          title="Verificación de Cédulas"
          subtitle="Alertas de identidad y validación oficial"
          onPress={() => router.push("/user-requests")}
        />
        <SettingsMenuRow
          icon="people-outline"
          iconColor="#0284C7"
          iconBgColor="#E0F2FE"
          title="Gestión de Usuarios"
          subtitle="Clientes, vendedores y transportistas"
          onPress={() => router.push("/user-management")}
        />
        <SettingsMenuRow
          icon="person-add-outline"
          iconColor="#4338CA"
          iconBgColor="#E0E7FF"
          title="Crear Usuario"
          subtitle="Alta directa de cuentas en el servidor"
          onPress={() => router.push("/create-user")}
        />
        <SettingsMenuRow
          icon="cube-outline"
          iconColor="#B45309"
          iconBgColor="#FEF3C7"
          title="Gestión de Productos"
          subtitle="Catálogo, stock y precios oficiales"
          onPress={() => router.push("/products-screen")}
        />
        <SettingsMenuRow
          icon="bus-outline"
          iconColor="#0F766E"
          iconBgColor="#CCFBF1"
          title="Gestión de Viajes"
          subtitle="Logística, choferes y despachos"
          onPress={() => router.push("/trips-screen")}
        />
        <SettingsMenuRow
          icon="card-outline"
          iconColor="#7E22CE"
          iconBgColor="#F3E8FF"
          title="Cuentas Bancarias"
          subtitle="Cuentas receptoras para transferencias"
          onPress={() => router.push("/(protected)/(tabs)/(settings)/(admin)/bank-accounts-screen" as any)}
        />
      </SettingsMenuCard>

      {/* Cerrar Sesión */}
      <SettingsLogoutButton onPress={handleLogout} />

      <ConfirmationModal
        visible={isLogoutModalVisible}
        title="Cerrar Sesión"
        message="¿Estás seguro que deseas salir de tu cuenta?"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
      />

      <EditAccountModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        user={user}
        onSuccess={updateUser}
      />
    </ScrollView>
  );
};

export default AdminSettingsMainScreen;

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
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 14,
  },
});
