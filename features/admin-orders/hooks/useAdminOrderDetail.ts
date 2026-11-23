import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useOrders } from "@/context/orderContext";
import { useLoading } from "@/context/loadingContext";
import { useAlert } from "@/context/alertContext";
import {
  approveOrder as approveOrderService,
  rejectedOrder as rejectOrderService,
  completePickupOrder as completePickupOrderService,
  getOrderDetail,
} from "@/services/orderService";
import { User } from "@/types/users";
import { Order } from "@/types/orders";
import { useAdminOrderTrips } from "./useAdminOrderTrips";

export const useAdminOrderDetail = (orderId?: string) => {
  const { orders, updateOrder } = useOrders();
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const selectedOrder = orders.find((o) => o.id === orderId);
  const [freshOrder, setFreshOrder] = useState<Order | null>(null);

  // Orden activa: usa la fresca de la API si existe, sino la de contexto local
  const currentOrder = freshOrder || selectedOrder;

  // Modales de acción de la orden
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [viewReceiptModalVisible, setViewReceiptModalVisible] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  // 1. Cargar datos frescos de la orden
  const fetchFreshOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const response = await getOrderDetail(orderId);
      if (response?.success && response?.order) {
        setFreshOrder(response.order);
      }
    } catch (error) {
      console.error("Error al cargar orden fresca:", error);
    }
  }, [orderId]);

  // Hook modularizado para viajes, fraccionamiento y choferes
  const {
    trip,
    drivers,
    allTrips,
    orderTrips,
    availableToDispatch,
    selectedDriverId,
    setSelectedDriverId,
    isDispatching,
    fetchTripDetails,
    fetchDriversAndTrips,
    refreshAllTripsData,
    planAndSplitTrips,
    splitSpecificTrip,
    dispatchNextTrip,
    assignDriverToTrip,
    cancelAndResplitTrip,
  } = useAdminOrderTrips({
    orderId,
    currentOrder,
    fetchFreshOrder,
    show,
    hide,
    showAlert,
  });

  // Refrescar automáticamente al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      if (orderId) {
        fetchFreshOrder();
        fetchTripDetails();
        fetchDriversAndTrips();
      }
    }, [orderId, fetchFreshOrder, fetchTripDetails, fetchDriversAndTrips])
  );

  // 2. Acción: Aprobar orden (con o sin conductor asignado, o con viajes planificados)
  const approveOrder = async (
    tripsPlan?: Array<{ totalTons: number; driverId?: string; comments?: string }>
  ) => {
    const targetId = currentOrder?.id;
    if (!targetId) return;

    try {
      show();
      const response = await approveOrderService(
        targetId,
        selectedDriverId || undefined,
        tripsPlan
      );

      if (response.success) {
        updateOrder(targetId, { status: "approved" });
        setFreshOrder((prev) => (prev ? { ...prev, status: "approved" } : null));
        await Promise.all([fetchTripDetails(), fetchDriversAndTrips()]);
        showAlert({
          message:
            tripsPlan && tripsPlan.length > 1
              ? `Orden aprobada y dividida en ${tripsPlan.length} viajes exitosamente.`
              : selectedDriverId
              ? "Orden aprobada y asignada al conductor correctamente."
              : "Orden aprobada correctamente.",
          type: "success",
        });
      } else {
        showAlert({ message: "No se pudo aprobar la orden.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Ocurrió un error al aprobar la orden.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  // 3. Acción: Rechazar orden con motivo
  const rejectOrder = async () => {
    const targetId = currentOrder?.id;
    if (!targetId) return;

    if (!declineReason || declineReason.trim() === "") {
      setRejectModalVisible(false);
      showAlert({
        message: "Debe escribir un motivo para rechazar la orden.",
        type: "warning",
      });
      return;
    }

    try {
      show();
      const response = await rejectOrderService(targetId, declineReason);
      if (response.success) {
        updateOrder(targetId, {
          status: "rejected",
          declineReason,
          rejectionReason: declineReason,
        });
        setFreshOrder((prev) =>
          prev ? { ...prev, status: "rejected", declineReason, rejectionReason: declineReason } : null
        );
        setRejectModalVisible(false);
        setDeclineReason("");
        showAlert({
          message: "Orden rechazada correctamente.",
          type: "success",
        });
      } else {
        showAlert({ message: "No se pudo rechazar la orden.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Ocurrió un error al rechazar la orden.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  // 4. Acción: Confirmar retiro en almacén
  const completePickup = async () => {
    const targetId = currentOrder?.id;
    if (!targetId) return;

    try {
      show();
      const response = await completePickupOrderService(targetId);
      if (response && response.success !== false) {
        updateOrder(targetId, { status: "completed" });
        setFreshOrder((prev) => (prev ? { ...prev, status: "completed" } : null));
        await refreshAll();
        showAlert({
          message: "Retiro en almacén confirmado exitosamente. El pedido ha sido completado.",
          type: "success",
        });
      } else {
        showAlert({ message: response?.message || "No se pudo completar el retiro.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Ocurrió un error al confirmar el retiro en almacén.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const refreshAll = useCallback(async () => {
    await refreshAllTripsData();
  }, [refreshAllTripsData]);

  return {
    currentOrder,
    trip,
    users: [] as User[],
    drivers,
    allTrips,
    orderTrips,
    availableToDispatch,
    dispatchNextTrip,
    assignDriverToTrip,
    cancelAndResplitTrip,
    planAndSplitTrips,
    splitSpecificTrip,
    isDispatching,
    selectedDriverId,
    setSelectedDriverId,
    rejectModalVisible,
    setRejectModalVisible,
    viewReceiptModalVisible,
    setViewReceiptModalVisible,
    declineReason,
    setDeclineReason,
    approveOrder,
    rejectOrder,
    completePickup,
    fetchFreshOrder,
    fetchTripDetails,
    fetchDriversAndTrips,
    refreshAll,
    setFreshOrder,
    updateOrder: (updated: Partial<Order>) => {
      if (currentOrder?.id) {
        updateOrder(currentOrder.id, updated);
      }
    },
  };
};
