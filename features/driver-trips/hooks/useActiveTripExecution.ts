import { useContext, useState } from "react";
import { Linking } from "react-native";
import { useRouter } from "expo-router";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { AcceptedTripContext } from "@/context/TripContext";
import { useMountEffect } from "@/hooks/lifeCicle";
import {
  orderDelivered,
  enqueueOfflineDelivery,
  syncPendingDeliveries,
} from "@/services/orderService";
import {
  getTripDetail,
  startOrCancelrip,
  updateTripStatus,
} from "@/services/tripsService";
import { stopBackgroundLocationUpdates } from "@/services/backgroundLocationTask";
import { useDriverLocationTracking } from "./useDriverLocationTracking";
import { updateDeliveryStatus } from "../utils/deliveryUtils";

export const useActiveTripExecution = () => {
  const router = useRouter();
  const { trip, saveTrip, clearTrip } = useContext(AcceptedTripContext);
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const { location, stopDriverLocationTracking } = useDriverLocationTracking(
    trip?.status,
    trip?.id
  );

  const [expandedOrderIndex, setExpandedOrderIndex] = useState<number | null>(null);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isDeliveryModalVisible, setIsDeliveryModalVisible] = useState(false);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<{
    orderId: string;
    deliveryIndex: number;
  } | null>(null);

  const navigateBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(tabs)/(home)/(driver)");
    }
  };

  useMountEffect(async () => {
    syncPendingDeliveries();
    if (trip?.id) {
      try {
        const response = await getTripDetail(trip.id);
        if (response?.success && response?.trip) {
          saveTrip(response.trip);
        }
      } catch (err) {
        console.error("Error cargando detalle completo del viaje activo:", err);
      }
    }
  });

  const handleStartTrip = async () => {
    if (!trip?.id) {
      showAlert({ message: "Error: No se encontró el ID del viaje.", type: "error" });
      return;
    }
    try {
      show();
      const response = await startOrCancelrip(trip.id, "started");
      if (response.success) {
        saveTrip({ ...trip, status: "started" });
        showAlert({ message: "Viaje iniciado. Puedes comenzar la ruta.", type: "success" });
      } else {
        showAlert({ message: response?.message || "Error: No se pudo iniciar el viaje.", type: "error" });
      }
    } catch (error: any) {
      console.error("Error al iniciar viaje:", error);
      showAlert({ message: error?.message || "Error: Ocurrió un error al iniciar el viaje.", type: "error" });
    } finally {
      hide();
    }
  };

  const handleOpenDeliveryModal = (orderId: string, deliveryIndex: number) => {
    setCurrentOrder({ orderId, deliveryIndex });
    setIsDeliveryModalVisible(true);
  };

  const handleSendDelivery = async () => {
    if (!currentOrder) return;
    try {
      show();
      const response = await orderDelivered(currentOrder.orderId, currentOrder.deliveryIndex);
      if (response?.success) {
        const updated = updateDeliveryStatus(trip, currentOrder.orderId, currentOrder.deliveryIndex, "delivered");
        saveTrip(updated);
        showAlert({ message: "Entrega marcada como realizada con éxito.", type: "success" });
      } else {
        showAlert({ message: response?.message || "Error al completar la entrega.", type: "error" });
      }
      setIsDeliveryModalVisible(false);
    } catch (error: any) {
      console.warn("⚠️ Sin conexión: guardando entrega en cola offline...", error?.message || error);
      await enqueueOfflineDelivery(currentOrder.orderId, currentOrder.deliveryIndex);
      const updated = updateDeliveryStatus(trip, currentOrder.orderId, currentOrder.deliveryIndex, "delivered");
      saveTrip(updated);
      showAlert({
        message: "Sin conexión. La entrega se guardó en tu teléfono y se sincronizará automáticamente.",
        type: "info",
      });
      setIsDeliveryModalVisible(false);
    } finally {
      hide();
    }
  };

  const confirmCancelTrip = async () => {
    if (!trip?.id) {
      showAlert({ message: "Error: No se encontró el ID del viaje.", type: "error" });
      return;
    }
    const trimmedReason = cancelReason.trim();
    if (trimmedReason.length < 5) {
      showAlert({
        message: "Debes ingresar un motivo de al menos 5 caracteres justificando la cancelación.",
        type: "warning",
      });
      return;
    }

    setIsCancelModalVisible(false);
    try {
      show();
      const response = await updateTripStatus(trip.id, "canceled", trimmedReason);
      if (response?.success) {
        stopDriverLocationTracking();
        await stopBackgroundLocationUpdates();
        clearTrip();
        setCancelReason("");
        showAlert({
          message: "El viaje ha sido cancelado. Se notificó al Administrador para su reasignación.",
          type: "success",
        });
        navigateBack();
      } else {
        showAlert({ message: response?.message || "Error al cancelar el viaje.", type: "error" });
      }
    } catch (error: any) {
      console.error("❌ Error al cancelar viaje en curso:", error);
      showAlert({ message: error?.message || "Error al cancelar el viaje.", type: "error" });
    } finally {
      hide();
    }
  };

  const handleCompleteOrder = async () => {
    if (!trip?.id) {
      showAlert({ message: "Error: No se encontró el ID del viaje.", type: "error" });
      return;
    }
    if (isSubmitting) return;

    // Abrir directamente el modal de seguridad para solicitar el código PIN al cliente
    setIsPinModalVisible(true);
  };

  const confirmCompleteWithPin = async (enteredPin: string) => {
    setIsPinModalVisible(false);
    if (!trip?.id) return;

    try {
      setIsSubmitting(true);
      show();
      const response = await updateTripStatus(trip.id, "completed", undefined, enteredPin);
      if (response.success) {
        stopDriverLocationTracking();
        await stopBackgroundLocationUpdates();
        clearTrip();

        showAlert({ message: response.message || "Entrega confirmada. ¡Viaje completado exitosamente!", type: "success" });
        navigateBack();
      } else {
        showAlert({ message: response.message || "Código de entrega inválido.", type: "error" });
      }
    } catch (error: any) {
      console.error("❌ Error al completar viaje con PIN:", error);
      showAlert({ message: error.message || "Error al verificar código de entrega.", type: "error" });
    } finally {
      setIsSubmitting(false);
      hide();
    }
  };

  const handleCallClient = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsapp = (phone: string) => {
    const formattedPhone = phone.startsWith("+") ? phone : `+1${phone}`;
    Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
  };

  const toggleOrder = (index: number) => {
    setExpandedOrderIndex((prev) => (prev === index ? null : index));
  };

  return {
    trip,
    location,
    expandedOrderIndex,
    isCancelModalVisible,
    cancelReason,
    setCancelReason,
    isDeliveryModalVisible,
    isPinModalVisible,
    setIsPinModalVisible,
    confirmCompleteWithPin,
    navigateBack,
    handleStartTrip,
    handleOpenDeliveryModal,
    handleSendDelivery,
    confirmCancelTrip,
    handleCompleteOrder,
    handleCallClient,
    handleWhatsapp,
    toggleOrder,
    setIsCancelModalVisible,
    setIsDeliveryModalVisible,
  };
};
