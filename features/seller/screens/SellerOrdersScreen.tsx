import React from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FilterChips, FilterOption } from "@/components/FilterChips";
import { SearchBar } from "@/components/common/SearchBar";
import { Palette } from "@/constants/theme";
import { useSellerOrders } from "../hooks/useSellerOrders";
import { OrderCard } from "@/components/orders/OrderCard";

const ORDER_FILTER_OPTIONS: FilterOption<string>[] = [
  { id: "Todos", label: "Todas" },
  { id: "pending", label: "Pendientes" },
  { id: "approved", label: "Aprobadas" },
  { id: "on_the_way", label: "En camino" },
  { id: "completed", label: "Entregadas" },
  { id: "rejected", label: "Rechazadas" },
];

export const SellerOrdersScreen: React.FC = () => {
  const router = useRouter();
  const {
    orders,
    rawOrdersCount,
    orderCounts,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    refreshing,
    fetchOrders,
  } = useSellerOrders();

  const handleViewDetails = (orderId: string) => {
    if (orderId) {
      router.push({
        pathname: "/seller-order-detail",
        params: { orderId },
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabecera */}
      <View style={styles.header}>
        <Text style={styles.title}>Ventas y Pedidos</Text>
        <Text style={styles.subtitle}>
          {rawOrdersCount} {rawOrdersCount === 1 ? "orden registrada" : "órdenes registradas"}
        </Text>
      </View>

      {/* Buscador Reutilizable */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por orden #, cliente o teléfono..."
        containerStyle={{ marginHorizontal: 16, marginBottom: 10, backgroundColor: "#FFFFFF" }}
      />

      {/* Filtros por Estado */}
      <FilterChips
        options={ORDER_FILTER_OPTIONS}
        activeFilter={statusFilter}
        onSelectFilter={(val) => setStatusFilter(val as any)}
        counts={orderCounts}
      />

      {/* Lista de Órdenes */}
      <FlatList
        data={orders}
        keyExtractor={(item, index) => item.id || `order-${index}`}
        renderItem={({ item }) => (
          <OrderCard order={item} onPressDetails={handleViewDetails} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchOrders}
            colors={[Palette.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No hay órdenes que coincidan</Text>
            <Text style={styles.emptySubtitle}>
              Prueba cambiando los filtros o el texto de búsqueda.
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
