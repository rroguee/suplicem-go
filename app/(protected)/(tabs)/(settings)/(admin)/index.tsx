import { AuthContext } from "@/context/authContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ConfirmationModal from "@/components/ConfirmationModal";

const AdminSettingsMainScreen: React.FC = () => {
  const router = useRouter();
  const { logOut } = useContext(AuthContext);

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

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
      <View style={styles.topLogoContainer}>
        <Image
          source={require("@/assets/images/logo2.png")}
          style={styles.topLogo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Configuración de Administrador</Text>

      <TouchableOpacity
        style={[styles.button, styles.primaryAlertButton]}
        onPress={() => router.push("/user-requests")}
      >
        <Ionicons name="shield-checkmark-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>Verificación de Cédulas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/user-management")}
      >
        <Ionicons name="person-add-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>Gestión de Usuarios</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/products-screen")}
      >
        <Ionicons name="cube-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>Gestión de Productos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/trips-screen")}
      >
        <Ionicons name="bus-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>Gestión de Viajes</Text>
      </TouchableOpacity>

        <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/create-user")}
      >
        <Ionicons name="person-add-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>Crear Usuario</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(protected)/(tabs)/(settings)/(admin)/bank-accounts-screen" as any)}
      >
        <Ionicons name="card-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>Cuentas Bancarias</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 30 }}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#E31E24" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <ConfirmationModal
        visible={isLogoutModalVisible}
        title="Cerrar Sesión"
        message="¿Estás seguro que deseas salir de tu cuenta?"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
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
    padding: 24,
    paddingBottom: 100,
  },
  topLogoContainer: {
    alignItems: "center",
    marginBottom: 8,
    marginTop: 10,
  },
  topLogo: {
    width: 180,
    height: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#0F294A",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F294A",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1E3A8A",
    marginBottom: 16,
    shadowColor: "#0F294A",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  primaryAlertButton: {
    backgroundColor: "#E31E24",
    borderColor: "#B91C1C",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#E31E24",
    borderRadius: 4,
    paddingVertical: 14,
    backgroundColor: "#FEF2F2",
  },
  logoutText: {
    color: "#E31E24",
    fontWeight: "700",
    fontSize: 16,
  },
});
