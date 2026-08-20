import { RegisterFormData } from "@/types/users";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import api from "./api";
import { safeRequest } from "./apiSafe";
import protectedApi from "./protectedApi";

export const createUserAccount = async (data: RegisterFormData) => {
  return await safeRequest(() => api.post("/users", data));
};

export const getUsers = async () => {
  const response = await protectedApi.get("/users");
  return response.data;
};

export const activeOrInactiveUser = async (uid: string, status: string) => {
  const response = await protectedApi.patch("/users/status", {
    uid,
    status,
  });
  console.log("BODY:", response);
  return response.data;
};

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  try {
    if (!Device.isDevice) {
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log("📲 Expo push token:", tokenData.data);

    return tokenData.data;
  } catch (error) {
    console.warn("Push notifications not supported in Expo Go:", error);
    return null;
  }
}

import { Address } from "@/types/users";
export { Address };

/**
 * @param uid 
 * @param phone E
 * @param vehicleBrand 
 * @param vehicleModel 
 */
export const updateDriverProfile = async (
  uid: string,
  phone: string,
  vehicleBrand: string,
  vehicleModel: string
) => {
  try {
    const response = await protectedApi.patch("/users/update", {
      uid,
      phone,
      vehicle: {
        brand: vehicleBrand,
        model: vehicleModel,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el perfil del conductor:", error);
    throw error;
  }
};

/**
 * @param uid 
 * @param phone 
 * @param addresses 
 */
export const updateClientProfile = async (
  uid: string,
  phone: string,
  addresses: Address[]
) => {
  try {
    const response = await protectedApi.patch("/users/update", {
      uid,
      phone,
      addresses,
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el perfil del cliente:", error);
    throw error;
  }
};
