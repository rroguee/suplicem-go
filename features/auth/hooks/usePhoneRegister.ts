import { useContext, useState } from "react";
import { useRouter } from "expo-router";
import { AuthContext } from "@/context/authContext";
import { useAlert } from "@/context/alertContext";
import { requestPhoneOtp, registerWithPhone } from "@/services/authService";
import { saveAuthSession, saveAcceptedTerms } from "@/utils/authStorage";

export const usePhoneRegister = () => {
  const authContext = useContext(AuthContext);
  const { showAlert } = useAlert();
  const router = useRouter();

  const [visible, setVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<Record<string, any> | null>(
    null
  );

  const requestCode = async (payload: Record<string, any>) => {
    const cleanPhone = String(payload.phone || "").trim();
    setIsSubmitting(true);
    const response = await requestPhoneOtp(cleanPhone, "register");
    setIsSubmitting(false);

    if (!response?.data?.success) {
      showAlert({
        message:
          response?.data?.message ||
          response?.message ||
          "No se pudo enviar el código de verificación.",
        type: "error",
      });
      return false;
    }

    setPendingPayload(payload);
    setPhone(cleanPhone);
    setCode("");
    setVisible(true);
    showAlert({
      message: "Te enviamos un código de 6 dígitos por SMS para completar tu registro.",
      type: "success",
    });
    return true;
  };

  const confirm = async () => {
    if (!pendingPayload) return;

    if (!/^\d{6}$/.test(code)) {
      showAlert({
        message: "Ingresa el código de 6 dígitos.",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    const response = await registerWithPhone({ ...pendingPayload, code });
    setIsSubmitting(false);

    const payload = response?.data;
    if (!payload?.success) {
      showAlert({
        message:
          payload?.message ||
          response?.message ||
          "No se pudo completar el registro.",
        type: "error",
      });
      return;
    }

    if (payload.idToken && payload.user) {
      const now = Date.now();
      await saveAuthSession({
        token: payload.idToken,
        refreshToken: payload.refreshToken,
        expiresAt: now + parseInt(payload.expiresIn || "3600") * 1000,
      });
      if (payload.user.uid) {
        await saveAcceptedTerms(payload.user.uid);
      }
      authContext.logIn(payload.user);
    }

    setVisible(false);
    setPendingPayload(null);
    setCode("");
    showAlert({
      message:
        "¡Registro exitoso! Tu solicitud ha sido guardada y está pendiente de verificación por el Administrador.",
      type: "success",
    });
    router.replace("/pending-approval");
  };

  const close = () => {
    if (isSubmitting) return;
    setVisible(false);
    setCode("");
  };

  return {
    visible,
    phone,
    code,
    setCode,
    isSubmitting,
    requestCode,
    confirm,
    close,
  };
};
