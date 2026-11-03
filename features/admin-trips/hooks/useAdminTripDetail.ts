import { useCallback, useContext, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { AcceptedTripContext } from "@/context/TripContext";
import { useLoading } from "@/context/loadingContext";
import { useAlert } from "@/context/alertContext";
import {
  getDriverLocation,
  getTripDetail,
  updateTripStatus,
} from "@/services/tripsService";

export const useAdminTripDetail = () => {
  const router = useRouter();
  const { trip, saveTrip } = useContext(AcceptedTripContext);
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const tripId = trip?.id;

  const refreshTripData = useCallback(async () => {
    if (!tripId) return;

    try {
      const tripResponse = await getTripDetail(tripId);
      if (tripResponse?.success && tripResponse?.trip) {
        saveTrip(tripResponse.trip);

        const currentStatus = tripResponse.trip.status;
        const driverId = tripResponse.trip.assignedDriverId;

        if ((currentStatus === "accepted" || currentStatus === "started") && driverId) {
          const locResponse = await getDriverLocation(driverId);
          if (locResponse?.success && locResponse?.location) {
            setDriverLocation({
              latitude: locResponse.location.lat,
              longitude: locResponse.location.lng,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error refrescando detalle del viaje:", error);
    }
  }, [tripId, saveTrip]);

  useFocusEffect(
    useCallback(() => {
      refreshTripData();
      const interval = setInterval(refreshTripData, 8000);
      return () => clearInterval(interval);
    }, [refreshTripData])
  );

  const handleCancelTrip = async () => {
    if (!tripId) {
      showAlert({
        message: "Error: No se encontró el identificador del viaje.",
        type: "error",
      });
      return;
    }

    const trimmedReason = cancellationReason.trim();
    if (trimmedReason.length < 5) {
      showAlert({
        message: "El motivo de cancelación debe tener al menos 5 caracteres.",
        type: "warning",
      });
      return;
    }

    setIsCancelModalVisible(false);

    try {
      show();
      const response = await updateTripStatus(tripId, "canceled", trimmedReason);
      if (response.success) {
        saveTrip({
          ...trip!,
          status: "canceled",
          cancellationReason: trimmedReason,
        });
        showAlert({
          message: "El viaje ha sido cancelado definitivamente.",
          type: "success",
        });
        router.back();
      } else {
        showAlert({
          message: response.message || "No se pudo cancelar el viaje.",
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("❌ Error cancelando viaje:", error);
      showAlert({
        message: error.message || "Ocurrió un error inesperado al cancelar.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

   const handleForceCompleteTrip = async () => {
    if (!tripId) return;

    try {
      show();
      const response = await updateTripStatus(tripId, "completed");
      if (response.success) {
        saveTrip({
          ...trip!,
          status: "completed",
        });
        showAlert({
          message: "El viaje ha sido completado y entregado exitosamente.",
          type: "success",
        });
      } else {
        showAlert({
          message: response.message || "No se pudo completar el viaje.",
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("❌ Error completando viaje por admin:", error);
      showAlert({
        message: error.message || "Ocurrió un error inesperado al completar el viaje.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const isTerminalStatus =
    trip?.status === "completed" || trip?.status === "canceled";

  return {
    trip,
    driverLocation,
    isCancelModalVisible,
    setIsCancelModalVisible,
    cancellationReason,
    setCancellationReason,
    handleCancelTrip,
    handleForceCompleteTrip,
    isTerminalStatus,
  };
};