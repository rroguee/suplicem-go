import { safeRequest } from "./apiSafe";
import protectedApi from "./protectedApi";

export const getTripAvailable = async () => {
  const response = await protectedApi.get("/trips/available");
  return response.data;
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
  totalTons: number,
  comments: string
) => {
  const response = await protectedApi.post("/trips", {
    tripNumber,
    orderIds,
    totalTons,
    comments,
  });
  return response.data;
};

export const startOrCancelrip = async (tripId: string, status: string) => {
  const response = await protectedApi.post("/trips/status/update", {
    tripId,
    status,
  });
  return response.data;
};

export const sendDriverLocation = async (lat: number, lng: number) => {
  return await safeRequest(() => protectedApi.post("/location", { lat, lng }));
};

export const getDriverLocation = async (driverId: string) => {
  const response = await safeRequest(() => protectedApi.get(`/location/${driverId}`));
  return response.data;
};
