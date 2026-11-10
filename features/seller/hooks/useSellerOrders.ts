import { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import { Order, OrderStatus } from "@/types/orders";
import { getAllOrders } from "@/services/orderService";
import { useAlert } from "@/context/alertContext";

export function useSellerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "Todos">("Todos");
  const [refreshing, setRefreshing] = useState(false);
  const { showAlert } = useAlert();

  const fetchOrders = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await getAllOrders();
      if (response?.success && response.orders) {
        setOrders(response.orders);
      } else {
        showAlert({
          message: "No se pudieron cargar las órdenes de venta.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error al cargar órdenes del vendedor:", error);
      showAlert({
        message: "Ocurrió un error al obtener las órdenes.",
        type: "error",
      });
    } finally {
      setRefreshing(false);
    }
  }, [showAlert]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todos: orders.length,
    };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Filtro por estado
      if (statusFilter !== "Todos" && order.status !== statusFilter) {
        return false;
      }

      // 2. Filtro por texto de búsqueda
      const query = search.toLowerCase().trim();
      if (!query) return true;

      const orderNumStr = String(order.orderNumber || "");
      const clientName = `${order.userNames || ""} ${order.userLastNames || ""}`.toLowerCase();
      const phone = String(order.userPhone || "");

      return (
        orderNumStr.includes(query) ||
        clientName.includes(query) ||
        phone.includes(query)
      );
    });
  }, [orders, statusFilter, search]);

  return {
    orders: filteredOrders,
    rawOrdersCount: orders.length,
    orderCounts,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    refreshing,
    fetchOrders,
  };
}
