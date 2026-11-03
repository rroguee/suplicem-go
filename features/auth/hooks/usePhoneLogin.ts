import { useContext, useState } from "react";
import { useRouter } from "expo-router";
import { AuthContext } from "@/context/authContext";
import { useAlert } from "@/context/alertContext";
import { requestPhoneOtp, verifyPhoneOtp } from "@/services/authService";
import { saveAuthSession } from "@/utils/authStorage";

type Step = "phone" | "code";

export const usePhoneLogin = () => {
  const authContext = useContext(AuthContext);
  const { showAlert } = useAlert();
  const router = useRouter();

  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setStep("phone");
    setPhone("");
    setCode("");
    setIsSubmitting(false);
  };

  const open = () => {
    reset();
    setVisible(true);
  };

  const close = () => {
    if (isSubmitting) return;
    setVisible(false);
    reset();
  };

  const requestCode = async () => {
    if (phone.replace(/\D/g, "").length < 10) {
      showAlert({
        message: "Ingresa un número de teléfono dominicano válido.",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    const response = await requestPhoneOtp(phone);
    setIsSubmitting(false);

    if (response?.data?.success) {
      setStep("code");
      showAlert({
        message: "Te enviamos un código de 6 dígitos por SMS.",
        type: "success",
      });
      return;
    }

    showAlert({
      message:
        response?.data?.message ||
        response?.message ||
        "No se pudo enviar el código de verificación.",
      type: "error",
    });
  };

  const confirmCode = async () => {
    if (!/^\d{6}$/.test(code)) {
      showAlert({
        message: "Ingresa el código de 6 dígitos.",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    const response = await verifyPhoneOtp(phone, code);
    setIsSubmitting(false);

    const payload = response?.data;
    if (!payload?.success) {
      showAlert({
        message:
          payload?.message ||
          response?.message ||
          "El código ingresado no es válido.",
        type: "error",
      });
      return;
    }

    const user = payload.user;
    const now = Date.now();
    await saveAuthSession({
      token: payload.idToken,
      refreshToken: payload.refreshToken,
      expiresAt: now + parseInt(payload.expiresIn || "3600") * 1000,
    });

    authContext.logIn(user);
    setVisible(false);
    reset();

    if (user?.status === "pending") {
      router.replace("/pending-approval");
    }
  };

  return {
    visible,
    step,
    phone,
    setPhone,
    code,
    setCode,
    isSubmitting,
    open,
    close,
    requestCode,
    confirmCode,
    backToPhone: () => setStep("phone"),
  };
};
