import React, { useContext, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "@/context/authContext";
import { useAlert } from "@/context/alertContext";
import {
  SettingsProfileCard,
  SettingsMenuCard,
  SettingsMenuRow,
  SettingsLogoutButton,
  EditAccountModal,
} from "@/components/settings";

export const SellerSettingsScreen: React.FC = () => {
  const { user, logOut, updateUser } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const router = useRouter();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const fullName = `${user?.names || ""} ${user?.lastNames || ""}`.trim() || "Vendedor Comercial";
  const sellerIdCode =
    (user as any)?.sellerCode ||
    (user?.uid ? `VEND-${user.uid.slice(0, 5).toUpperCase()}` : "VEND-OFICIAL");

  const handleConfirmLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas salir de tu cuenta comercial?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar Sesión", style: "destructive", onPress: () => logOut() },
      ]
    );
  };

  const handleNavigateCreateClient = () => {
    router.push("/(protected)/(tabs)/(orders)/create-client" as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Panel Comercial</Text>

      {/* Tarjeta de Perfil */}
      <SettingsProfileCard
        name={fullName}
        email={user?.email}
        phone={user?.phone}
        badgeText={`Credencial: ${sellerIdCode}`}
        badgeIcon="pricetag"
        badgeColor="#0369A1"
        badgeBgColor="#E0F2FE"
        badgeBorderColor="#BAE6FD"
        avatarIcon="person"
      />

      {/* Gestión Comercial */}
      <SettingsMenuCard title="Gestión Comercial">
        <SettingsMenuRow
          icon="person-circle-outline"
          iconColor="#0F294A"
          iconBgColor="#E2E8F0"
          title="Editar Mi Cuenta"
          subtitle="Actualiza tu nombre, apellido y teléfono"
          onPress={() => setIsEditModalVisible(true)}
        />
        <SettingsMenuRow
          icon="person-add-outline"
          iconColor="#0284C7"
          iconBgColor="#E0F2FE"
          title="Dar de Alta Nuevo Cliente"
          subtitle="Registra prospectos vinculados a tu cartera"
          onPress={handleNavigateCreateClient}
        />
        <SettingsMenuRow
          icon="headset-outline"
          iconColor="#166534"
          iconBgColor="#DCFCE7"
          title="Contacto con Administración"
          subtitle="Soporte operativo y logística"
          onPress={() =>
            showAlert({
              message:
                "Para asistencia o consultas de despacho, comunícate con la central de Suplicem al (809) 555-0199.",
              type: "info",
            })
          }
        />
      </SettingsMenuCard>

      {/* Cerrar Sesión */}
      <SettingsLogoutButton onPress={handleConfirmLogout} />

      <EditAccountModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        user={user}
        onSuccess={updateUser}
      />
    </ScrollView>
  );
};

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
