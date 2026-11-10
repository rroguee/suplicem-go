import { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import { User } from "@/types/users";
import { getUsers } from "@/services/userService";
import { useAlert } from "@/context/alertContext";

export function useSellerClients() {
  const [clients, setClients] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [refreshing, setRefreshing] = useState(false);
  const { showAlert } = useAlert();

  const fetchClients = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await getUsers({ userType: "client" });
      if (response?.users) {
        // Filtrar clientes
        const onlyClients = response.users.filter(
          (u: User) => !u.userType || u.userType === "client"
        );
        setClients(onlyClients);
      } else {
        showAlert({
          message: "No se pudieron cargar los clientes.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      showAlert({
        message: "Ocurrió un error al obtener la lista de clientes.",
        type: "error",
      });
    } finally {
      setRefreshing(false);
    }
  }, [showAlert]);

  useFocusEffect(
    useCallback(() => {
      fetchClients();
    }, [fetchClients])
  );

  const statusCounts = useMemo(() => {
    const counts = { all: clients.length, active: 0, inactive: 0 };
    clients.forEach((c) => {
      const st = c.status?.toLowerCase();
      if (st === "active") counts.active++;
      else if (st === "inactive" || st === "pending") counts.inactive++;
    });
    return counts;
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // 1. Filtro por estado
      if (statusFilter === "active" && client.status !== "active") return false;
      if (
        statusFilter === "inactive" &&
        client.status !== "inactive" &&
        client.status !== "pending"
      ) {
        return false;
      }

      // 2. Filtro por búsqueda
      const query = search.toLowerCase().trim();
      if (!query) return true;

      const fullName = `${client.names || ""} ${client.lastNames || ""}`.toLowerCase();
      const phone = String(client.phone || "");
      const doc = String(client.identification || "");

      return (
        fullName.includes(query) ||
        phone.includes(query) ||
        doc.includes(query)
      );
    });
  }, [clients, statusFilter, search]);

  return {
    clients: filteredClients,
    totalClientsCount: clients.length,
    statusCounts,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    refreshing,
    fetchClients,
  };
}
