import { useState, useCallback } from "react";
import { Linking } from "react-native";
import { useFocusEffect } from "expo-router";
import { getOrderTracking } from "@/services/orderService";

export const useClientOrderTracking = (selectedOrder?: any) => {
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [trip, setTrip] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [tonsInfo, setTonsInfo] = useState<{
    totalTons: number;
    deliveredTons: number;
    pendingBalance: number;
  }>({
    totalTons: 0,
    deliveredTons: 0,
    pendingBalance: 0,
  });

  const refreshDriverLocationAndTripStatus = useCallback(async () => {
    if (!selectedOrder?.id) return;

    try {
      const response = await getOrderTracking(selectedOrder.id);
      const trackingData = response?.data?.tracking || (response as any)?.tracking;
      if (trackingData) {
        const { trip: trackingTrip, location, driver, trips: trackingTrips } = trackingData;
        let mergedTrip = null;
        if (trackingTrip) {
          mergedTrip = {
            ...trackingTrip,
            assignedDriverId: trackingTrip.assignedDriverId || driver?.id,
            driver: trackingTrip.driver || driver,
            deliveryPin: trackingTrip.deliveryPin,
          };
          setTrip(mergedTrip);
        }

        if (Array.isArray(trackingTrips) && trackingTrips.length > 0) {
          setTrips(trackingTrips);
        } else if (mergedTrip) {
          setTrips([mergedTrip]);
        } else {
          setTrips([]);
        }

        setTonsInfo({
          totalTons: Number(trackingData.totalTons) || Number(selectedOrder.totalTons) || 0,
          deliveredTons: Number(trackingData.deliveredTons) || Number(selectedOrder.deliveredTons) || 0,
          pendingBalance: Number(trackingData.pendingBalance) || Number(selectedOrder.pendingBalance) || 0,
        });

        if (location) {
          setDriverLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          });
        }
      }
    } catch (error) {
      console.error("Error al obtener tracking de orden:", error);
    }
  }, [selectedOrder?.id, selectedOrder?.totalTons, selectedOrder?.deliveredTons, selectedOrder?.pendingBalance]);

  useFocusEffect(
    useCallback(() => {
      if (!selectedOrder) return;

      refreshDriverLocationAndTripStatus();

      const isTerminal = ["completed", "rejected", "cancelled"].includes(selectedOrder?.status);
      if (isTerminal) return;

      const interval = setInterval(() => {
        refreshDriverLocationAndTripStatus();
      }, 15000);

      return () => clearInterval(interval);
    }, [selectedOrder, refreshDriverLocationAndTripStatus])
  );

  const handleCallDriver = (phoneToCall?: string) => {
    const phone = phoneToCall || trip?.driver?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleWhatsapp = (phone?: string) => {
    const targetPhone = phone || trip?.driver?.phone;
    if (targetPhone) {
      const formattedPhone = targetPhone.startsWith("+") ? targetPhone : `+1${targetPhone}`;
      Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
    }
  };

  return {
    trip,
    trips,
    tonsInfo,
    driverLocation,
    handleCallDriver,
    handleWhatsapp,
  };
};
