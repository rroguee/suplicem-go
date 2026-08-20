import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { useMountEffect } from "@/hooks/lifeCicle";
import { activeOrInactiveUser, getUsers } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const UsersListScreen: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const sortUsers = (usersArray: any[]) => {
    // Clona el array para no mutar el estado original directamente
    const sortedArray = [...usersArray];
    // Ordena los usuarios: 'inactive' primero, luego 'active'
    return sortedArray.sort((a, b) => {
      if (a.status === "inactive" && b.status !== "inactive") {
        return -1;
      }
      if (a.status !== "inactive" && b.status === "inactive") {
        return 1;
      }
      if (a.status === "active" && b.status !== "active") {
        return 1;
      }
      if (a.status !== "active" && b.status === "active") {
        return -1;
      }
      return 0;
    });
  };

  const fetchUsers = async () => {
    try {
      show();
      const response = await getUsers();
      if (response.success) {
        setUsers(sortUsers(response.users));
      } else {
        showAlert({
          message: "No se pudieron obtener los usuarios.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Ocurrió un error al obtener los usuarios.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  useMountEffect(async () => {
    fetchUsers();
  });

  const handleActivate = async (uid: string) => {
    try {
      show();
      const response = await activeOrInactiveUser(uid, "active");
      if (response) {
        const updatedUsers = users.map((user) =>
          user.uid === uid ? { ...user, status: "active" } : user
        );
        setUsers(sortUsers(updatedUsers));
        showAlert({
          message: "Usuario activado correctamente.",
          type: "success",
        });
      } else {
        showAlert({
          message: "No se pudo activar el usuario.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Ocurrió un error al activar el usuario.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const handleInactivate = async (uid: string) => {
    try {
      show();
      const response = await activeOrInactiveUser(uid, "inactive");
      if (response) {
        const updatedUsers = users.map((user) =>
          user.uid === uid ? { ...user, status: "inactive" } : user
        );
        setUsers(sortUsers(updatedUsers));
        showAlert({
          message: "Usuario inactivado correctamente.",
          type: "success",
        });
      } else {
        Alert.alert("Error", "");
        showAlert({
          message: "No se pudo inactivar el usuario.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "");
      showAlert({
        message: "Ocurrió un error al inactivar el usuario.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const filteredUsers = sortUsers(
    users.filter((user) => {
      const query = search.toLowerCase();
      return (
        user.names?.toLowerCase().includes(query) ||
        user.lastNames?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.identificationType?.toLowerCase().includes(query) ||
        user.identification?.toLowerCase().includes(query) ||
        user.userType?.toLowerCase().includes(query) ||
        user.status?.toLowerCase().includes(query)
      );
    })
  );

  const translateStatus = (status: string) => {
    if (status === "active") return "Activo";
    if (status === "inactive") return "Inactivo";
    return status;
  };
  const translateRole = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "driver":
        return "Conductor";
      case "client":
        return "Cliente";
      default:
        return role;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <Text style={styles.title}>Lista de Usuarios</Text>

      <TextInput
        placeholder="Buscar usuario..."
        placeholderTextColor="#999"
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />

      {filteredUsers.map((user) => (
        <View key={user.uid} style={styles.userCard}>
          <View style={styles.userHeader}>
            <Ionicons name="person-circle-outline" size={32} color="#E31E24" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.userName}>
                {user.names} {user.lastNames}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    user.status === "active" ? "#28a745" : "#dc3545",
                },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {translateStatus(user.status)}
              </Text>
            </View>
          </View>

          <View style={styles.userDetailRow}>
            <Ionicons name="briefcase-outline" size={18} color="#0F294A" />
            <Text style={styles.userDetailText}>
              {translateRole(user.userType)}
            </Text>
          </View>

          <View style={styles.userDetailRow}>
            <Ionicons name="card-outline" size={18} color="#0F294A" />
            <Text style={styles.userDetailText}>
              {user.identificationType} - {user.identification}
            </Text>
          </View>

          {["pending", "inactive"].includes(user.status) ? (
            <TouchableOpacity
              style={styles.activateButton}
              onPress={() => handleActivate(user.uid)}
            >
              <Text style={styles.buttonText}>Activar</Text>
            </TouchableOpacity>
          ) : user.status === "active" ? (
            <TouchableOpacity
              style={styles.inactivateButton}
              onPress={() => handleInactivate(user.uid)}
            >
              <Text style={styles.buttonText}>Inactivar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
};

export default UsersListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  input: {
    marginBottom: 16,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  userCard: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 13,
    color: "#555",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  userDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  userDetailText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#555",
  },
  activateButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  inactivateButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
