import { useAlert } from "@/context/alertContext";
import { useOrders } from "@/context/orderContext";
import { getAllOrders } from "@/services/orderService";
import { OrderStatus } from "@/types/orders";
import { OrderCard } from "@/components/orders/OrderCard";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FilterChips, FilterOption } from "@/components/FilterChips";
import { Palette } from "@/constants/theme";

const ORDER_FILTER_OPTIONS: FilterOption<string>[] = [
  { id: "Todos", label: "Todas" },
  { id: "pending", label: "Pendientes" }, 
  { id: "Alertas IA", label: "⚠️ Alertas IA" },
  { id: "approved", label: "Aprobadas" },
  { id: "on_the_way", label: "En camino" },
  { id: "completed", label: "Entregadas" },
  { id: "rejected", label: "Rechazadas" },
];

const AdminOrdersScreen = () => {
  const { orders, setOrders } = useOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "Todos" | "Alertas IA">(
    "Todos"
  );
  const [refreshing, setRefreshing] = useState(false);
  const { showAlert } = useAlert();
  const router = useRouter();

  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todos: orders.length,
      "Alertas IA": orders.filter((o: any) => o.aiRiskFlag === true).length,
    };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

   const fetchOrders = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await getAllOrders();
      if (response.success && response.orders) {
        setOrders(response.orders);
      } else {
        showAlert({
          message: "No se pudieron cargar las órdenes.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Ocurrió un error al obtener las órdenes.",
        type: "error",
      });
    } finally {
      setRefreshing(false);
    }
  }, [setOrders, showAlert]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const handleViewDetails = useCallback(
    (orderId: string) => {
      router.push({
        pathname: "/admin-order-detail",
        params: { orderId },
      });
    },
    [router]
  );

  const sortedOrders = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    const filtered = orders.filter((order) => {
      const matchesSearch =
        !searchLower ||
        (order.orderNumber &&
          order.orderNumber.toString().toLowerCase().includes(searchLower)) ||
        (order.userNames &&
          order.userNames.toLowerCase().includes(searchLower)) ||
        (order.userLastNames &&
          order.userLastNames.toLowerCase().includes(searchLower)) ||
        (order.userId && order.userId.toLowerCase().includes(searchLower));

      const matchesStatus =
        statusFilter === "Todos"
          ? true
          : statusFilter === ("Alertas IA" as any)
          ? (order as any).aiRiskFlag === true
          : order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;

      const orderA = parseInt(String(a.orderNumber), 10);
      const orderB = parseInt(String(b.orderNumber), 10);
      return orderB - orderA;
    });
  }, [orders, search, statusFilter]);

  const renderHeader = useCallback(
    () => (
      <>
        <View style={styles.topLogoContainer}>
          <Image
            source={require("@/assets/images/logo2.png")}
            style={styles.topLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.title}>Órdenes de Clientes</Text>

          <TouchableOpacity onPress={fetchOrders} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#E31E24" />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Buscar ..."
          placeholderTextColor="#999"
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />

        <FilterChips
          options={ORDER_FILTER_OPTIONS}
          activeFilter={statusFilter}
          onSelectFilter={(filter) => setStatusFilter(filter as any)}
          counts={orderCounts}
          activeColor={statusFilter === "Alertas IA" ? "#D32F2F" : Palette.primary}
          style={{ marginBottom: 12 }}
        />
      </>
    ),
    [fetchOrders, search, statusFilter, orderCounts]
  );

  const renderOrderItem = useCallback(
    ({ item }: { item: any }) => (
      <OrderCard
        key={item.id}
        order={item}
        onPressDetails={handleViewDetails}
      />
    ),
    [handleViewDetails]
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
      data={sortedOrders}
      keyExtractor={(item) => item.id}
      renderItem={renderOrderItem}
      ListHeaderComponent={renderHeader}
      initialNumToRender={8}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={fetchOrders}
          colors={["#E31E24"]}
          tintColor="#E31E24"
        />
      }
    />
  );
};

export default AdminOrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  topLogoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  topLogo: {
    width: 180,
    height: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0F294A",
  },
  input: {
    marginBottom: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FAFAFA",
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderColor: "#E31E24",
    borderWidth: 1,
  },
  filterButtonActive: {
    backgroundColor: "#E31E24",
  },
  filterButtonText: {
    color: "#E31E24",
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderColor: "#eee",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  id: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  info: {
    fontSize: 15,
    marginTop: 6,
    color: "#4a4a4a",
  },
  item: {
    marginLeft: 12,
    color: "#666",
    fontSize: 14,
    marginTop: 2,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: "#E31E24",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  reasonText: {
    marginTop: 12,
    fontStyle: "italic",
    color: "#888",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    elevation: 2,
  },
  cardAiRisk: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },
  aiAlertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  aiAlertText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#991B1B",
    flex: 1,
  },
});
