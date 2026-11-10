import React from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FilterChips, FilterOption } from "@/components/FilterChips";
import { SearchBar } from "@/components/common/SearchBar";
import { Palette } from "@/constants/theme";
import { User } from "@/types/users";
import { CartContext } from "@/context/cartContext";
import { useSellerClients } from "../hooks/useSellerClients";
import { SellerClientCard } from "../components/SellerClientCard";

const CLIENT_FILTER_OPTIONS: FilterOption<string>[] = [
  { id: "all", label: "Todos los Clientes" },
  { id: "active", label: "Activos" },
  { id: "inactive", label: "Inactivos" },
];

export const SellerClientsScreen: React.FC = () => {
  const router = useRouter();
  const { setAssistedClient } = React.useContext(CartContext);
  const {
    clients,
    totalClientsCount,
    statusCounts,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    refreshing,
    fetchClients,
  } = useSellerClients();

  const handleRegisterClient = () => {
    router.push("/(protected)/(tabs)/(orders)/create-client" as any);
  };

  const handleNewOrder = (client: User) => {
    // Activa la venta asistida para este cliente y redirige al catálogo
    setAssistedClient(client);
    router.push("/(protected)/(tabs)/(home)" as any);
  };

  return (
    <View style={styles.container}>
      {/* Cabecera con Botón de Alta Rápida */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Mis Clientes</Text>
          <Text style={styles.subtitle}>
            {totalClientsCount} {totalClientsCount === 1 ? "cliente en cartera" : "clientes en cartera"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addClientBtn}
          onPress={handleRegisterClient}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add" size={16} color="#FFFFFF" />
          <Text style={styles.addClientBtnText}>Registrar</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador Reutilizable */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por nombre, teléfono o RNC/Cédula..."
        containerStyle={{ marginHorizontal: 16, marginBottom: 10, backgroundColor: "#FFFFFF" }}
      />

      {/* Filtros de Estado */}
      <FilterChips
        options={CLIENT_FILTER_OPTIONS}
        activeFilter={statusFilter}
        onSelectFilter={(val) => setStatusFilter(val as any)}
        counts={statusCounts}
      />

      {/* Lista de Clientes */}
      <FlatList
        data={clients}
        keyExtractor={(item, index) => item.uid || `client-${index}`}
        renderItem={({ item }) => (
          <SellerClientCard client={item} onPressNewOrder={handleNewOrder} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchClients}
            colors={[Palette.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No se encontraron clientes</Text>
            <Text style={styles.emptySubtitle}>
              Puedes registrar un nuevo cliente tocando el botón "+ Registrar" arriba.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F294A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  addClientBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0284C7",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  addClientBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
    paddingTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#475569",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 24,
  },
});
