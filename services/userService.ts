import { RegisterFormData } from "@/types/users";
import * as Device from "expo-device";
import api from "./api";
import { safeRequest } from "./apiSafe";
import protectedApi from "./protectedApi";

export const createUserAccount = async (data: any) => {
  if (data instanceof FormData) {
    return await safeRequest(() => api.post("/users", data));
  }

  const formData = new FormData();

  const imageUri = data.identificationImageUri || data.identificationImage || data.idDocument;
  if (imageUri && typeof imageUri === "string" && !imageUri.startsWith("data:")) {
    const filename = imageUri.split("/").pop() || "cedula.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("identificationImage", {
      uri: imageUri,
      name: filename,
      type,
    } as any);
  }

  Object.keys(data).forEach((key) => {
    if (
      key !== "identificationImageUri" &&
      key !== "identificationImage" &&
      key !== "idDocument"
    ) {
      const val = data[key];
      if (val !== undefined && val !== null) {
        if (typeof val === "object") {
          formData.append(key, JSON.stringify(val));
        } else {
          formData.append(key, String(val));
        }
      }
    }
  });

  return await safeRequest(() => api.post("/users", formData));
};

export const createUserAccountByAdmin = async (data: any) => {
  if (data instanceof FormData) {
    return await safeRequest(() => protectedApi.post("/users", data));
  }

  const formData = new FormData();

  const imageUri = data.identificationImageUri || data.identificationImage || data.idDocument;
  if (imageUri && typeof imageUri === "string" && !imageUri.startsWith("data:")) {
    const filename = imageUri.split("/").pop() || "cedula.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("identificationImage", {
      uri: imageUri,
      name: filename,
      type,
    } as any);
  }

  Object.keys(data).forEach((key) => {
    if (
      key !== "identificationImageUri" &&
      key !== "identificationImage" &&
      key !== "idDocument"
    ) {
      const val = data[key];
      if (val !== undefined && val !== null) {
        if (typeof val === "object") {
          formData.append(key, JSON.stringify(val));
        } else {
          formData.append(key, String(val));
        }
      }
    }
  });

  return await safeRequest(() => protectedApi.post("/users", formData));
};

export const getUsers = async (params?: {
  status?: string;
  userType?: string;
  aiRiskFlag?: boolean;
}) => {
  const response = await protectedApi.get("/users", { params });
  return response.data;
};

export const getUserById = async (uid: string) => {
  const response = await protectedApi.get(`/users/${uid}`);
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

    const Notifications = await import("expo-notifications");
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
  vehicleModel: string,
  vehicleYear?: string,
  vehicleTons?: string,
  vehiclePlateNumber?: string
) => {
  try {
    const response = await protectedApi.patch("/users/update", {
      uid,
      phone,
      vehicle: {
        brand: vehicleBrand,
        model: vehicleModel,
        year: vehicleYear || "",
        tons: vehicleTons || "",
        plateNumber: vehiclePlateNumber || "",
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

export const updateUserAddresses = async (uid: string, addresses: Address[]) => {
  try {
    const response = await protectedApi.patch("/users/update", {
      uid,
      addresses,
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar direcciones del usuario:", error);
    throw error;
  }
};

export const assignSellerToClient = async (
  clientId: string,
  sellerId: string | null
) => {
  try {
    const response = await protectedApi.patch("/users/update", {
      uid: clientId,
      sellerId: sellerId || null,
    });
    return response.data;
  } catch (error) {
    console.error("Error al asignar vendedor al cliente:", error);
    throw error;
  }
};

export interface UpdateOwnProfilePayload {
  names: string;
  lastNames: string;
  phone: string;
}

export const updateOwnProfile = async (
  uid: string,
  data: UpdateOwnProfilePayload
): Promise<{ success: boolean; message?: string }> => {
  const result = await safeRequest(() =>
    protectedApi.patch("/users/update", { uid, ...data })
  );
  return result.success
    ? { success: true }
    : { success: false, message: result.message };
};
