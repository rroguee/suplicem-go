import { ORDER_PREFIX } from "@/constants/UserConstants";
import { useAlert } from "@/context/alertContext";
import { useApprovedOrders } from "@/context/approvedOrderContext";
import { useLoading } from "@/context/loadingContext";
import { useOrders } from "@/context/orderContext";
import { getAllOrders } from "@/services/orderService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type OrderStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "on_the_way"
  | "delivered"
  | "requested";

type LocalAdminOrder = {
  id: string;
  orderNumber: string;
  userNames: string;
  userLastNames: string;
  clientName: string;
  items: any[];
  status: OrderStatus;
  declineReason?: string;
  deliveryType?: string;
};

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "approved",
  "rejected",
  "on_the_way",
  "delivered",
  "requested",
];

const mapStatusToDisplay = (status: OrderStatus) => {
  switch (status) {
    case "pending":
    case "requested":
      return "Pendiente";
    case "approved":
      return "Aprobada";
    case "rejected":
      return "Rechazada";
    case "on_the_way":
      return "En Camino";
    case "delivered":
      return "Entregada";
    default:
      return status;
  }
};

const statusColors: Record<OrderStatus, string> = {
  pending: "#FFC107",
  requested: "#FFC107",
  approved: "#4CAF50",
  rejected: "#F44336",
  on_the_way: "#03A9F4",
  delivered: "#4CAF50",
};

const AdminOrdersScreen = () => {
  const { orders, setOrders } = useOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "Todos">(
    "Todos"
  );
  const { show, hide } = useLoading();
  const { setApprovedOrders } = useApprovedOrders();
  const { showAlert } = useAlert();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    try {
      show();
      const response = await getAllOrders();
      if (response.success && response.orders) {
        setOrders(response.orders);

        const approvedOnly = response.orders
          .filter((order: any) => order.status === "approved")
          .map((order: any) => ({
            trackingEnabled: false,
            id: order.id,
            orderNumber: order.orderNumber,
            userNames: order.userNames,
            userLastNames: order.userLastNames,
            userId: order.userId,
            deliveryType: order.deliveryType || "",
            deliveries: order.deliveries || [],
            items: order.items || [],
            comments: order.comments || "",
            status: order.status,
            createdAt: order.createdAt || "",
          }));
        setApprovedOrders(approvedOnly);
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
      hide();
    }
  };

  const handleViewDetails = (orderId: string) => {
    router.push({
      pathname: "/admin-order-detail",
      params: { orderId },
    });
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = search.toLowerCase();

    const matchesSearch =
      (order.orderNumber &&
        order.orderNumber.toString().toLowerCase().includes(searchLower)) ||
      (order.userNames &&
        order.userNames.toLowerCase().includes(searchLower)) ||
      (order.userLastNames &&
        order.userLastNames.toLowerCase().includes(searchLower)) ||
      (order.userId && order.userId.toLowerCase().includes(searchLower));

    const matchesStatus =
      statusFilter === "Todos" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
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

        <View style={styles.filterContainer}>
          {["Todos", ...STATUS_OPTIONS].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                statusFilter === status && styles.filterButtonActive,
              ]}
              onPress={() => setStatusFilter(status as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  statusFilter === status && { color: "#fff" },
                ]}
              >
                {status === "Todos"
                  ? "Todos"
                  : mapStatusToDisplay(status as OrderStatus)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {[...filteredOrders]
          .sort((a, b) => {
            if (a.status === "pending" && b.status !== "pending") return -1;
            if (a.status !== "pending" && b.status === "pending") return 1;

            const orderA = parseInt(a.orderNumber, 10);
            const orderB = parseInt(b.orderNumber, 10);
            return orderB - orderA;
          })
          .map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => handleViewDetails(order.id)}
            >
              <View style={styles.infoRow}>
                <Text style={styles.id}>
                  {ORDER_PREFIX.ORD}
                  {order.orderNumber}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColors[order.status] },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {mapStatusToDisplay(order.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.info}>
                Cliente: {order.userNames} {order.userLastNames}
              </Text>

              <Text style={styles.info}>
                Tipo de entrega: {order.deliveryType}
              </Text>

              <Text style={[styles.info, { marginTop: 8, fontWeight: "bold" }]}>
                Productos:
              </Text>

              {order.items.map((item: any, idx: number) => (
                <Text key={idx} style={styles.item}>
                  - {item.name} - {item.quantity} {item.unit}
                </Text>
              ))}

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.viewDetailsButton}
                  onPress={() => handleViewDetails(order.id)}
                >
                  <Text style={styles.buttonText}>Ver detalle</Text>
                </TouchableOpacity>
              </View>

              {order.status === "rejected" && order.declineReason && (
                <Text style={styles.reasonText}>
                  Motivo: {order.declineReason}
                </Text>
              )}
            </TouchableOpacity>
          ))}
      </ScrollView>
    </>
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
});
