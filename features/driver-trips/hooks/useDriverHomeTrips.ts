import { useContext, useState, useCallback, useMemo } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { AuthContext } from "@/context/authContext";
import { useLoading } from "@/context/loadingContext";
import { useAlert } from "@/context/alertContext";
import { AcceptedTripContext } from "@/context/TripContext";
import {
  getDriverActiveTrip,
  getDriverActualTrips,
  updateTripStatus,
} from "@/services/tripsService";

export const useDriverHomeTrips = () => {
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [actualTrips, setActualTrips] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const { user } = useContext(AuthContext);
  const { trip: contextTrip, saveTrip, clearTrip } = useContext(AcceptedTripContext);

  const hasAcceptedTrip = Boolean(
    (activeTrip && activeTrip.status !== "assigned") ||
    (contextTrip && contextTrip.status !== "assigned")
  );

  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [tripToReject, setTripToReject] = useState<any>(null);
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const handleOpenRejectModal = (trip: any) => {
    setTripToReject(trip);
    setRejectReason("");
    setIsRejectModalVisible(true);
  };

  const handleCloseRejectModal = () => {
    setIsRejectModalVisible(false);
    setTripToReject(null);
    setRejectReason("");
  };

  const validateTrips = async () => {
    try {
      const actualRes = await getDriverActualTrips();
      const myActuals = actualRes?.data?.trips || [];
      setActualTrips(Array.isArray(myActuals) ? myActuals : []);

      const response = await getDriverActiveTrip();

      if (response?.success && response?.data?.hasActiveTrip && response?.data?.trip) {
        const trip = response.data.trip;
        const isMyTrip =
          !user?.uid ||
          trip.assignedDriverId === user?.uid ||
          trip.driverId === user?.uid ||
          trip.driver?.id === user?.uid;

        if (isMyTrip) {
          setActiveTrip(trip);
          saveTrip(trip);
          return;
        }
      }

      setActiveTrip(null);
      clearTrip();
    } catch (error) {
      console.error("Error validando viaje activo:", error);
      setActiveTrip(null);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await validateTrips();
    setRefreshing(false);
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      const getTripsAsync = async () => {
        show();
        await validateTrips();
        hide();
      };

      getTripsAsync();
      return () => {};
    }, [user?.uid])
  );

  const handleConfirmReject = async () => {
    if (!tripToReject?.id) return;
    if (rejectReason.trim().length < 5) {
      showAlert({
        message: "El motivo del rechazo debe tener al menos 5 caracteres.",
        type: "warning",
      });
      return;
    }

    setIsSubmittingReject(true);
    show();
    try {
      const res = await updateTripStatus(tripToReject.id, "canceled", rejectReason.trim());
      if (res?.success) {
        handleCloseRejectModal();
        showAlert({
          message: "Has rechazado el viaje. Se ha notificado al Administrador para su reasignación.",
          type: "success",
        });
        await validateTrips();
      } else {
        showAlert({
          message: res?.message || "No se pudo rechazar el viaje.",
          type: "error",
        });
      }
    } catch (err: any) {
      showAlert({
        message: err?.message || "Error al rechazar el viaje.",
        type: "error",
      });
    } finally {
      setIsSubmittingReject(false);
      hide();
    }
  };

  const activeTripsToRender = useMemo(() => {
    const list = actualTrips.length > 0 ? [...actualTrips] : activeTrip ? [activeTrip] : [];
    return list.sort((a, b) => {
      // Prioridad 1: Viajes en ruta ('started' o 'in_progress') primero
      const isRouteA = a.status === "started" || a.status === "in_progress" ? 1 : 0;
      const isRouteB = b.status === "started" || b.status === "in_progress" ? 1 : 0;
      if (isRouteA !== isRouteB) {
        return isRouteB - isRouteA;
      }
      // Prioridad 2: Si tienen el mismo estatus, ordenar por fecha más reciente
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [actualTrips, activeTrip]);

  return {
    activeTrip,
    actualTrips,
    activeTripsToRender,
    refreshing,
    onRefresh,
    hasAcceptedTrip,
    isRejectModalVisible,
    rejectReason,
    setRejectReason,
    isSubmittingReject,
    saveTrip,
    handleOpenRejectModal,
    handleCloseRejectModal,
    handleConfirmReject,
    router,
  };
};
