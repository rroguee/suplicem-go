import { ORDER_PREFIX } from "@/constants/UserConstants";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { useOrders } from "@/context/orderContext";
import { getMyOrders } from "@/services/orderService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type OrderItem = {
  id: string;
  orderNumber?: string | number | null;
  items: {
    name: string;
    quantity: number;
  }[];
  status: string;
  createdAt: string;
};

const ClientOrdersMainScreen: React.FC = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();

  // 'setSelectedOrder' ya no se usa, así que la eliminamos de la desestructuración
  const { orders, setOrders } = useOrders();
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const fetchOrders = async () => {
    try {
      show();
      const response = await getMyOrders();
      setOrders(response.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showAlert({
        message: "Error al cargar las órdenes. Por favor, inténtalo de nuevo.",
        type: "error",
      });
    }
    hide();
  };

  const filteredOrders = orders.filter((order) => {
    const searchTerm = search.trim().toLowerCase();

    const matchesItem = order.items?.some(
      (item) =>
        typeof item?.name === "string" &&
        item.name.toLowerCase().includes(searchTerm)
    );

    const matchesId =
      typeof order.id === "string" &&
      order.id.toLowerCase().includes(searchTerm);

    const orderNumberString = String(order.orderNumber ?? "").toLowerCase();
    const matchesOrderNumber = orderNumberString.includes(searchTerm);

    return matchesItem || matchesId || matchesOrderNumber;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aPending = a.status === "pending";
    const bPending = b.status === "pending";

    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;

    const numA = parseInt(String(a.orderNumber ?? "0"), 10);
    const numB = parseInt(String(b.orderNumber ?? "0"), 10);

    return numB - numA;
  });

  const renderStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "approved":
        return "#4CAF50";
      case "on_the_way":
        return "#FF9800";
      case "pending":
        return "#FFC107";
      case "canceled":
        return "#F44336";
      case "rejected":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "delivered":
        return "Entregado";
      case "approved":
        return "Aprobado";
      case "on_the_way":
        return "En camino";
      case "pending":
        return "Pendiente";
      case "canceled":
        return "Cancelado";
      case "rejected":
        return "Rechazado";
      default:
        return status;
    }
  };

  // Se modificó la función para que no use 'setSelectedOrder'
  const goToOrderDetail = (id: string) => {
    router.push({
      pathname: "/client-order-detail",
      params: { orderId: id },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Histórico de órdenes</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#A04A0E" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholderTextColor="#999"
        placeholder="Buscar..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.list}>
        {sortedOrders.map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.card}
            onPress={() => goToOrderDetail(order.id)}
          >
            <Text style={styles.orderNumber}>
              {ORDER_PREFIX.ORD}
              {String(order.orderNumber ?? "N/A")}
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Productos:</Text>
              <Text style={styles.value}>{order.items.length}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha:</Text>
              <Text style={styles.value}>
                {new Date(order.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Estado:</Text>
              <Text
                style={[
                  styles.value,
                  {
                    color: renderStatusColor(order.status),
                    fontWeight: "bold",
                  },
                ]}
              >
                {translateStatus(order.status)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default ClientOrdersMainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8f3",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#A04A0E",
    marginBottom: 24,
  },
  searchInput: {
    height: 45,
    backgroundColor: "#ffffff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  orderNumber: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontWeight: "600",
    fontSize: 14,
    color: "#444",
  },
  value: {
    fontSize: 14,
    color: "#555",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1c9b0",
    backgroundColor: "#fff",
    shadowColor: "#A04A0E",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
});
