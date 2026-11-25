import { useContext, useState } from "react";
import { useRouter } from "expo-router";
import { AuthContext } from "@/context/authContext";
import { useLoading } from "@/context/loadingContext";
import { useAlert } from "@/context/alertContext";
import { getCurrentUser, login, recoverPassword, resendVerificationEmail } from "@/services/authService";
import { saveAuthSession } from "@/utils/authStorage";

export const useLogin = () => {
  const authContext = useContext(AuthContext);
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Modal de recuperación
  const [modalVisible, setModalVisible] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // Modal de reenvío de verificación
  const [resendModalVisible, setResendModalVisible] = useState(false);
  const [resendEmail, setResendEmail] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({
        message: "Por favor, complete todos los campos",
        type: "error",
      });
      return;
    }

    show();

    const responseLogin = await login(email, password);

    if (responseLogin?.data?.success) {
      const responseUser = await getCurrentUser(responseLogin?.data?.idToken);

      if (responseUser?.data?.success) {
        const user = responseUser?.data?.user;

        if (user?.status === "pending") {
          const now = Date.now();
          const newSession = {
            token: responseLogin?.data?.idToken,
            refreshToken: responseLogin?.data?.refreshToken,
            expiresAt: now + parseInt(responseLogin?.data?.expiresIn || "3600") * 1000,
          };
          await saveAuthSession(newSession);
          authContext.logIn(user);
          hide();
          router.replace("/pending-approval");
          return;
        }

        if (user?.status === "rejected") {
          showAlert({
            message: "Tu solicitud de registro ha sido rechazada. Comunícate con soporte.",
            type: "error",
          });
          hide();
          return;
        }

        if (user?.status === "inactive" || user?.status === "banned") {
          showAlert({
            message: "Cuenta suspendida temporalmente.",
            type: "info",
          });
          hide();
          return;
        }

        if (!responseLogin?.data?.emailVerified) {
          setResendEmail(email);
          showAlert({
            message:
              "Aún no has verificado tu cuenta. Revisa tu correo o presiona 'Reenviar' abajo si no recibiste el enlace.",
            type: "info",
          });
          hide();
          return;
        }

        const now = Date.now();
        const newSession = {
          token: responseLogin?.data?.idToken,
          refreshToken: responseLogin?.data?.refreshToken,
          expiresAt: now + parseInt(responseLogin?.data?.expiresIn || "3600") * 1000,
        };

        await saveAuthSession(newSession);
        authContext.logIn(user);
      } else {
        showAlert({
          message:
            responseUser?.message ||
            responseUser?.data?.message ||
            "No se pudo cargar la información del usuario",
          type: "error",
        });
      }
    } else {
      showAlert({
        message: responseLogin?.message || "Credenciales inválidas",
        type: "error",
      });
    }

    hide();
  };

  const handlePasswordReset = async () => {
    if (!recoveryEmail) {
      showAlert({
        message: "Ingrese su correo electrónico",
        type: "error",
      });
      return;
    }

    setModalVisible(false);
    show();

    const responseRecovery = await recoverPassword(recoveryEmail);

    if (responseRecovery?.data?.success) {
      showAlert({
        message: `Se enviará un correo a ${recoveryEmail} para restablecer su contraseña.`,
        type: "info",
      });
      setRecoveryEmail("");
    } else {
      showAlert({
        message: "El correo no existe",
        type: "error",
      });
    }

    hide();
  };

  const handleResendVerification = async () => {
    const targetEmail = resendEmail.trim();
    if (!targetEmail) {
      showAlert({
        message: "Por favor, ingrese su correo electrónico",
        type: "error",
      });
      return;
    }

    show();
    const response = await resendVerificationEmail(targetEmail);
    hide();

    if (response?.data?.success) {
      showAlert({
        message:
          "Se ha enviado un nuevo enlace de activación a tu correo. Revisa tu bandeja de entrada o spam.",
        type: "success",
      });
      setResendModalVisible(false);
    } else {
      showAlert({
        message:
          response?.data?.message || "Error al reenviar el correo de verificación.",
        type: "error",
      });
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    modalVisible,
    setModalVisible,
    recoveryEmail,
    setRecoveryEmail,
    resendModalVisible,
    setResendModalVisible,
    resendEmail,
    setResendEmail,
    handleLogin,
    handlePasswordReset,
    handleResendVerification,
  };
};
