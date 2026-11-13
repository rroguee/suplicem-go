import { safeRequest } from "./apiSafe";
import protectedApi from "./protectedApi";

export const getTripAvailable = async () => {
  try {
    const response = await protectedApi.get("/trips/available");
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener viajes disponibles:", error);
    return { success: false, trips: [], message: error?.message || "Error al conectar" };
  }
};

export const getAllTrips = async () => {
  const response = await protectedApi.get("/trips");
  return response.data;
};

export const getDriverTripsHistory = async () => {
  const response = await protectedApi.get("/trips/driver/history");
  return response.data;
};

export const getDriverActualTrips = async () => {
  return await safeRequest(() => protectedApi.get("/trips/driver/actual"));
};

export const getDriverActiveTrip = async () => {
  return await safeRequest(() => protectedApi.get("/trips/driver/active"));
};

export const aceptedTrip = async (id: string) => {
  return await safeRequest(() => protectedApi.patch(`/trips/${id}/accept`));
};

export const getTripDetail = async (id: string) => {
  const response = await safeRequest(() => protectedApi.get(`/trips/${id}`));
  return response.data;
};

export const getTripByOrderId = async (orderId: string) => {
  const response = await safeRequest(() => protectedApi.get(`/trips/order/${orderId}`));
  return response.data;
};

export const createTrip = async (
  tripNumber: string,
  orderIds: string[],
  comments: string,
  totalTons?: number,
  driverId?: string
) => {
  const payload: Record<string, any> = {
    tripNumber,
    orderIds,
    comments,
  };
  if (totalTons !== undefined && totalTons > 0) {
    payload.totalTons = totalTons;
  }
  if (driverId && driverId.trim() !== "") {
    payload.driverId = driverId;
  }
  const response = await protectedApi.post("/trips", payload);
  return response.data;
};

export const updateTripStatus = async (
  tripId: string,
  status: string,
  reason?: string,
  deliveryPin?: string
) => {
  const result = await safeRequest(() =>
    protectedApi.patch(`/trips/${tripId}/status`, {
      tripId,
      status,
      targetStatus: status,
      reason,
      cancellationReason: reason,
      deliveryPin,
    })
  );
  if (result.success) {
    return result.data;
  }
  return {
    success: false,
    message: result.message,
  };
};

export const startOrCancelrip = async (tripId: string, status: string) => {
  return await updateTripStatus(tripId, status);
};

export const sendDriverLocation = async (lat: number, lng: number) => {
  return await safeRequest(() => protectedApi.post("/location", { lat, lng }));
};

export const getDriverLocation = async (driverId: string) => {
  const response = await safeRequest(() => protectedApi.get(`/location/${driverId}`));
  return response.data;
};

export const assignTripDriver = async (tripId: string, driverId: string) => {
  const result = await safeRequest(() =>
    protectedApi.patch(`/trips/${tripId}/assign`, { driverId })
  );
  if (result.success) {
    return result.data;
  }
  return {
    success: false,
    message: result.message || "Error al asignar conductor al viaje",
  };
};

export const splitOrderTrips = async (
  orderId: string,
  trips: Array<{
    totalTons: number;
    driverId?: string;
    comments?: string;
    deliveryId?: string;
    destinationAddress?: any;
  }>
) => {
  const result = await safeRequest(() =>
    protectedApi.post(`/trips/order/${orderId}/split-plan`, { trips })
  );
  if (result.success) {
    return result.data;
  }
  return {
    success: false,
    message: result.message || "Error al planificar los viajes de la orden",
  };
};

export const splitSingleTrip = async (
  tripId: string,
  trips: Array<{ totalTons: number; driverId?: string; comments?: string }>
) => {
  const result = await safeRequest(() =>
    protectedApi.post(`/trips/${tripId}/split`, { trips })
  );
  if (result.success) {
    return result.data;
  }
  return {
    success: false,
    message: result.message || "Error al fraccionar el viaje",
  };
};

export const getTripDirections = async (
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
) => {
  return await safeRequest(() =>
    protectedApi.get("/trips/directions", {
      params: { originLat, originLng, destLat, destLng },
    })
  );
};


