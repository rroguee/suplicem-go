import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { useMountEffect } from "@/hooks/lifeCicle";
import { activeOrInactiveUser, getUsers } from "@/services/userService";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterChips, FilterOption } from "@/components/FilterChips";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ROLE_OPTIONS: FilterOption<"all" | "client" | "driver" | "admin">[] = [
  { id: "all", label: "Todos los roles" },
  { id: "client", label: "Clientes" },
  { id: "driver", label: "Conductores" },
  { id: "admin", label: "Administradores" },
];

const STATUS_OPTIONS: FilterOption<"all" | "active" | "inactive">[] = [
  { id: "all", label: "Cualquier estado" },
  { id: "active", label: "Activos" },
  { id: "inactive", label: "Inactivos" },
];

const UsersListScreen: React.FC = () => {
   const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "client" | "driver" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
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

  const roleCounts = useMemo(() => {
    const counts = { all: users.length, client: 0, driver: 0, admin: 0 };
    users.forEach((u) => {
      const role = u.userType?.toLowerCase();
      if (role === "client") counts.client++;
      else if (role === "driver") counts.driver++;
      else if (role === "admin") counts.admin++;
    });
    return counts;
  }, [users]);

  const statusCounts = useMemo(() => {
    const counts = { all: users.length, active: 0, inactive: 0 };
    users.forEach((u) => {
      const st = u.status?.toLowerCase();
      if (st === "active") counts.active++;
      else if (st === "inactive" || st === "pending") counts.inactive++;
    });
    return counts;
  }, [users]);

  const filteredUsers = useMemo(() => {
    return sortUsers(
      users.filter((user) => {
        // 1. Filtro por Rol
        if (roleFilter !== "all" && user.userType?.toLowerCase() !== roleFilter) {
          return false;
        }

        if (statusFilter === "active" && user.status?.toLowerCase() !== "active") {
          return false;
        }
        if (
          statusFilter === "inactive" &&
          user.status?.toLowerCase() !== "inactive" &&
          user.status?.toLowerCase() !== "pending"
        ) {
          return false;
        }

        

        const query = search.toLowerCase().trim();
        if (!query) return true;
        return (
          user.names?.toLowerCase().includes(query) ||
          user.lastNames?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.identification?.toLowerCase().includes(query) ||
          user.driverCode?.toLowerCase().includes(query) ||
          user.vehicle?.plateNumber?.toLowerCase().includes(query)
        );
      })
    );
  }, [users, roleFilter, statusFilter, search]);

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

      {/* Filtro por Rol */}
      <FilterChips
        options={ROLE_OPTIONS}
        activeFilter={roleFilter}
        onSelectFilter={setRoleFilter}
        counts={roleCounts}
      />

      {/* Filtro por Estado */}
      <FilterChips
        options={STATUS_OPTIONS}
        activeFilter={statusFilter}
        onSelectFilter={setStatusFilter}
        counts={statusCounts}
        activeColor="#0F294A"
      />

      {filteredUsers.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={42} color="#94A3B8" />
          <Text style={styles.emptyText}>
            No se encontraron usuarios con los filtros seleccionados.
          </Text>
        </View>
      )}

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
            <StatusBadge status={user.status} size="small" />
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

          {user.userType === "driver" && (
            <View style={styles.driverIdBadgeAdmin}>
              <Ionicons name="barcode-outline" size={16} color="#0F294A" />
              <Text style={styles.driverIdAdminText}>
                ID Conductor:{" "}
                <Text style={{ fontWeight: "bold", color: "#E31E24" }}>
                  {user.driverCode || (user.uid ? `COND-${user.uid.slice(0, 5).toUpperCase()}` : "COND-XXXX")}
                </Text>
              </Text>
            </View>
          )}

          {user.userType === "driver" && user.vehicle && (
            <View style={styles.driverPlateBadgeAdmin}>
              <Ionicons name="car-sport-outline" size={16} color="#0F294A" />
              <Text style={styles.driverPlateAdminText}>
                🛞 Placa: <Text style={{ fontWeight: "bold" }}>{user.vehicle.plateNumber || "No registrada"}</Text> ({user.vehicle.brand} {user.vehicle.model})
              </Text>
            </View>
          )}

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
  driverIdBadgeAdmin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEE2E2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 6,
    marginBottom: 2,
  },
  driverIdAdminText: {
    fontSize: 13,
    color: "#991B1B",
    fontWeight: "500",
  },
  driverPlateBadgeAdmin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 6,
    marginBottom: 4,
  },
  driverPlateAdminText: {
    fontSize: 13,
    color: "#0F294A",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
});
