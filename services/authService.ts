import api from "./api";
import { safeRequest } from "./apiSafe";

export const login = async (email: string, password: string) => {
  return await safeRequest(() => api.post("/auth/login", { email, password }));
};

export const requestPhoneOtp = async (
  phone: string,
  purpose: "login" | "register" = "login"
) => {
  return await safeRequest(() => api.post("/auth/otp/request", { phone, purpose }));
};

export const verifyPhoneOtp = async (phone: string, code: string) => {
  return await safeRequest(() => api.post("/auth/otp/verify", { phone, code }));
};

export const registerWithPhone = async (payload: Record<string, any>) => {
  const imageUri = payload.identificationImage || payload.identificationImageUri;
  if (imageUri && typeof imageUri === "string" && !imageUri.startsWith("http")) {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() || "cedula.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("identificationImage", {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    Object.keys(payload).forEach((key) => {
      if (
        key !== "identificationImage" &&
        key !== "identificationImageUri" &&
        payload[key] !== undefined
      ) {
        if (typeof payload[key] === "object") {
          formData.append(key, JSON.stringify(payload[key]));
        } else {
          formData.append(key, String(payload[key]));
        }
      }
    });

    return await safeRequest(() =>
      api.post("/auth/register-phone", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  }

  return await safeRequest(() => api.post("/auth/register-phone", payload));
};

export const recoverPassword = async (email: string) => {
  return await safeRequest(() =>
    api.post("/auth/recover-password", { email })
  );
};

export const getCurrentUser = async (token: string) => {
  return await safeRequest(() =>
    api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
};

export const resendVerificationEmail = async (email: string, idToken?: string) => {
  return await safeRequest(() =>
    api.post("/auth/resend-verification", { email, idToken })
  );
};

export const lookupRnc = async (rnc: string) => {
  return await safeRequest(() => api.get(`/identity/rnc/${rnc}`));
};