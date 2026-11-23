import { useState, useCallback, useMemo } from "react";
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

interface UseAdminOrderTripsProps {
  orderId?: string;
  currentOrder: Order | null | undefined;
  fetchFreshOrder: () => Promise<void>;
  show: () => void;
  hide: () => void;
  showAlert: (config: { message: string; type: "success" | "error" | "warning" | "info" }) => void;
}

export const useAdminOrderTrips = ({
  orderId,
  currentOrder,
  fetchFreshOrder,
  show,
  hide,
  showAlert,
}: UseAdminOrderTripsProps) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [isDispatching, setIsDispatching] = useState(false);

  const fetchTripDetails = useCallback(async () => {
    if (!orderId) return;
    try {
      const response = await getTripByOrderId(orderId);
      if (response?.success && response?.trip) setTrip(response.trip);
    } catch (error) {
      console.error("Error al cargar viaje asociado:", error);
    }
  }, [orderId]);

  const fetchDriversAndTrips = useCallback(async () => {
    try {
      const [driversRes, tripsRes] = await Promise.all([
        getUsers({ userType: "driver", status: "active" }),
        getAllTrips(),
      ]);
      if (driversRes.success && driversRes.users) setDrivers(driversRes.users);
      if (tripsRes?.success && tripsRes?.trips) setAllTrips(tripsRes.trips);
    } catch (error) {
      console.error("Error al obtener conductores o viajes:", error);
    }
  }, []);

  const orderTrips = useMemo(
    () =>
      allTrips.filter(
        (t) =>
          t.orderIds?.includes(currentOrder?.id || "") &&
          String(t.status || "").toLowerCase() !== "canceled"
      ),
    [allTrips, currentOrder?.id]
  );

  const availableToDispatch = Number(
    currentOrder?.pendingBalance ??
    Math.max(0, (Number(currentOrder?.totalTons) || 0) - (Number(currentOrder?.deliveredTons) || 0))
  );

  const refreshAllTripsData = useCallback(async () => {
    await Promise.all([fetchFreshOrder(), fetchTripDetails(), fetchDriversAndTrips()]);
  }, [fetchFreshOrder, fetchTripDetails, fetchDriversAndTrips]);

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
        await refreshAllTripsData();
        return true;
      }
      showAlert({
        message: response?.message || "No se pudo actualizar la planificación de viajes.",
        type: "error",
      });
      return false;
    } catch (error: any) {
      console.error(error);
      showAlert({ message: error?.message || "Error al planificar los viajes de la orden.", type: "error" });
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
        await refreshAllTripsData();
        return true;
      }
      showAlert({ message: response?.message || "No se pudo fraccionar el viaje.", type: "error" });
      return false;
    } catch (error: any) {
      console.error(error);
      showAlert({ message: error?.message || "Error al fraccionar el viaje.", type: "error" });
      return false;
    } finally {
      hide();
    }
  };

  const dispatchNextTrip = async (tonsToDispatch?: number, driverId?: string) => {
    const finalTons = tonsToDispatch && tonsToDispatch > 0 ? tonsToDispatch : availableToDispatch;
    if (!currentOrder?.id || finalTons <= 0) return;

    try {
      setIsDispatching(true);
      show();
      const nextTripNumber = `TRIP-${currentOrder.orderNumber || currentOrder.id.slice(0, 5).toUpperCase()}-${orderTrips.length + 1}`;
      const chosenDriver = driverId && driverId.trim() !== "" ? driverId.trim() : undefined;
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
        if (tripsRes?.success && tripsRes?.trips) setAllTrips(tripsRes.trips);
        fetchTripDetails();
        fetchFreshOrder();
      } else {
        showAlert({ message: response?.message || "No se pudo crear el viaje.", type: "error" });
      }
    } catch (err: any) {
      console.error("Error al despachar siguiente viaje:", err);
      showAlert({ message: err?.message || "Error al programar el viaje.", type: "error" });
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
          showAlert({ message: "Conductor asignado al viaje correctamente.", type: "success" });
        }
        await refreshAllTripsData();
        return true;
      }
      showAlert({ message: response?.message || "No se pudo asignar el conductor.", type: "error" });
      return false;
    } catch (error: any) {
      console.error(error);
      showAlert({ message: error?.message || "Error al asignar conductor al viaje.", type: "error" });
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
        await refreshAllTripsData();
        return true;
      }
      showAlert({ message: response?.message || "No se pudo cancelar el viaje.", type: "error" });
      return false;
    } catch (error: any) {
      console.error(error);
      showAlert({ message: error?.message || "Error al cancelar el viaje.", type: "error" });
      return false;
    } finally {
      hide();
    }
  };

  return {
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
  };
};
