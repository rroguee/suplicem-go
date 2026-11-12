import { useState, useCallback, useEffect, useMemo } from "react";
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
import {
  getTripByOrderId,
  getAllTrips,
  createTrip,
  assignTripDriver,
  updateTripStatus,
  splitOrderTrips,
  splitSingleTrip,
} from "@/services/tripsService";

import { getUsers } from "@/services/userService";
import { User } from "@/types/users";
import { Order } from "@/types/orders";
import { Trip } from "@/types/trips";

export const useAdminOrderDetail = (orderId?: string) => {
  const { orders, updateOrder } = useOrders();
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const selectedOrder = orders.find((o) => o.id === orderId);
  const [freshOrder, setFreshOrder] = useState<Order | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);

  // Orden activa: usa la fresca de la API si existe, sino la de contexto local
  const currentOrder = freshOrder || selectedOrder;

  // Estados de actores (usuarios y conductores)
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  // Modales de acción
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

  // 2. Cargar datos del viaje asociado a la orden
  const fetchTripDetails = useCallback(async () => {
    if (!orderId) return;
    try {
      const response = await getTripByOrderId(orderId);
      if (response?.success && response?.trip) {
        setTrip(response.trip);
      }
    } catch (error) {
      console.error("Error al cargar viaje asociado:", error);
    }
  }, [orderId]);

  // 4. Cargar conductores disponibles (activos) y viajes
  const fetchDriversAndTrips = useCallback(async () => {
    try {
      const [driversRes, tripsRes] = await Promise.all([
        getUsers({ userType: "driver", status: "active" }),
        getAllTrips(),
      ]);
      if (driversRes.success && driversRes.users) {
        setDrivers(driversRes.users);
      }
      if (tripsRes?.success && tripsRes?.trips) {
        setAllTrips(tripsRes.trips);
      }
    } catch (error) {
      console.error("Error al obtener conductores o viajes:", error);
    }
  }, []);

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

  // Nota: La información y direcciones del cliente ya viajan dentro del objeto 'order' (clientAddresses / userAddresses).
  // La carga de choferes y viajes ya se gestiona de forma única en useFocusEffect al entrar a la pantalla.

  // 5. Acción: Aprobar orden (con o sin conductor asignado, o con viajes planificados)
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
          message: tripsPlan && tripsPlan.length > 1
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

  const planAndSplitTrips = async (
    tripsPlan: Array<{ totalTons: number; driverId?: string; comments?: string }>,
    silent?: boolean
  ): Promise<boolean> => {
    const targetId = currentOrder?.id;
    if (!targetId || !tripsPlan?.length) return false;

    try {
      show();
      const response = await splitOrderTrips(targetId, tripsPlan);
      if (response?.success) {
        if (!silent) {
          showAlert({
            message: `Viajes actualizados y fraccionados en ${tripsPlan.length} despachos.`,
            type: "success",
          });
        }
        await refreshAll();
        return true;
      } else {
        showAlert({
          message: response?.message || "No se pudo actualizar la planificación de viajes.",
          type: "error",
        });
        return false;
      }
    } catch (error: any) {
      console.error(error);
      showAlert({
        message: error?.message || "Error al planificar los viajes de la orden.",
        type: "error",
      });
      return false;
    } finally {
      hide();
    }
  };

  const splitSpecificTrip = async (
    tripId: string,
    subTrips: Array<{ totalTons: number; driverId?: string; comments?: string }>,
    silent?: boolean
  ): Promise<boolean> => {
    if (!tripId || !subTrips?.length) return false;

    try {
      show();
      const response = await splitSingleTrip(tripId, subTrips);
      if (response?.success) {
        if (!silent) {
          showAlert({
            message: `Viaje fraccionado exitosamente en ${subTrips.length} despachos.`,
            type: "success",
          });
        }
        await refreshAll();
        return true;
      } else {
        showAlert({
          message: response?.message || "No se pudo fraccionar el viaje.",
          type: "error",
        });
        return false;
      }
    } catch (error: any) {
      console.error(error);
      showAlert({
        message: error?.message || "Error al fraccionar el viaje.",
        type: "error",
      });
      return false;
    } finally {
      hide();
    }
  };


  // 6. Acción: Rechazar orden con motivo
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
          declineReason: declineReason,
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

  // 7. Cálculos de viajes simultáneos y pendientes
  const orderTrips = useMemo(
    () =>
      allTrips.filter(
        (t) =>
          t.orderIds?.includes(currentOrder?.id || "") &&
          String(t.status || "").toLowerCase() !== "canceled"
      ),
    [allTrips, currentOrder?.id]
  );
  const activeTrips = orderTrips.filter((t) =>
    ["available", "assigned", "accepted", "started", "in_progress"].includes(String(t.status || "").toLowerCase())
  );
  const tonsInTransit = activeTrips.reduce((sum, t) => sum + (Number(t.totalTons) || 0), 0);
  const alreadyDelivered = Number(currentOrder?.deliveredTons) || 0;
  const orderTotalTons = Number(currentOrder?.totalTons || currentOrder?.pendingBalance) || 0;
  const availableToDispatch = Math.max(0, orderTotalTons - alreadyDelivered - tonsInTransit);

  const [isDispatching, setIsDispatching] = useState(false);

  // 8. Acción: Programar viaje siguiente / simultáneo
  const dispatchNextTrip = async (tonsToDispatch?: number, driverId?: string) => {
    const finalTons = tonsToDispatch && tonsToDispatch > 0 ? tonsToDispatch : availableToDispatch;
    if (!currentOrder?.id || finalTons <= 0) return;

    try {
      setIsDispatching(true);
      show();
      const nextTripNumber = `TRIP-${currentOrder.orderNumber || currentOrder.id.slice(0, 5).toUpperCase()}-${orderTrips.length + 1}`;
      const chosenDriver =
        driverId && driverId.trim() !== "" ? driverId.trim() : undefined;
      const response = await createTrip(
        nextTripNumber,
        [currentOrder.id],
        "Despacho programado por administración",
        finalTons,
        chosenDriver
      );

      if (response?.success) {
        showAlert({
          message: `Viaje ${nextTripNumber} creado exitosamente (${finalTons.toFixed(2)} t).`,
          type: "success",
        });
        setSelectedDriverId("");
        const tripsRes = await getAllTrips();
        if (tripsRes?.success && tripsRes?.trips) {
          setAllTrips(tripsRes.trips);
        }
        fetchTripDetails();
        fetchFreshOrder();
      } else {
        showAlert({
          message: response?.message || "No se pudo crear el viaje.",
          type: "error",
        });
      }
    } catch (err: any) {
      console.error("Error al despachar siguiente viaje:", err);
      showAlert({
        message: err?.message || "Error al programar el viaje.",
        type: "error",
      });
    } finally {
      setIsDispatching(false);
      hide();
    }
  };

  const assignDriverToTrip = async (
    tripId: string,
    driverId: string,
    silent?: boolean
  ): Promise<boolean> => {
    if (!tripId || !driverId) return false;
    try {
      show();
      const response = await assignTripDriver(tripId, driverId);
      if (response?.success) {
        if (!silent) {
          showAlert({
            message: "Conductor asignado al viaje correctamente.",
            type: "success",
          });
        }
        await refreshAll();
        return true;
      } else {
        showAlert({
          message: response?.message || "No se pudo asignar el conductor.",
          type: "error",
        });
        return false;
      }
    } catch (error: any) {
      console.error(error);
      showAlert({
        message: error?.message || "Error al asignar conductor al viaje.",
        type: "error",
      });
      return false;
    } finally {
      hide();
    }
  };

  const cancelAndResplitTrip = async (tripId: string): Promise<boolean> => {
    if (!tripId) return false;
    try {
      show();
      const response = await updateTripStatus(
        tripId,
        "canceled",
        "Cancelado por administración para fraccionar el viaje"
      );
      if (response?.success) {
        showAlert({
          message: "Viaje cancelado. El tonelaje ha sido liberado para reprogramarlo.",
          type: "success",
        });
        await refreshAll();
        return true;
      } else {
        showAlert({
          message: response?.message || "No se pudo cancelar el viaje.",
          type: "error",
        });
        return false;
      }
    } catch (error: any) {
      console.error(error);
      showAlert({
        message: error?.message || "Error al cancelar el viaje.",
        type: "error",
      });
      return false;
    } finally {
      hide();
    }
  };

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchFreshOrder(),
      fetchTripDetails(),
      fetchDriversAndTrips(),
    ]);
  }, [fetchFreshOrder, fetchTripDetails, fetchDriversAndTrips]);

  return {
    currentOrder,
    trip,
    users,
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
