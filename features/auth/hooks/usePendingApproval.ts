import { useState, useContext } from "react";
import { AuthContext } from "@/context/authContext";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { getCurrentUser } from "@/services/authService";
import { getAuthSession } from "@/utils/authStorage";

export function usePendingApproval() {
  const authContext = useContext(AuthContext);
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCheckStatus = async () => {
    try {
      show();
      setIsRefreshing(true);

      const session = await getAuthSession();
      if (!session?.token) {
        showAlert({
          message: "No hay sesión activa. Por favor, inicia sesión de nuevo.",
          type: "warning",
        });
        authContext.logOut();
        return;
      }

      const resUser = await getCurrentUser(session.token);
      if (resUser?.data?.success) {
        const updatedUser = resUser.data.user;

        if (updatedUser?.status === "active") {
          showAlert({
            message: "🎉 ¡Tu cuenta ha sido aprobada y habilitada con éxito! Bienvenido a Suplicem.",
            type: "success",
          });
          authContext.logIn(updatedUser);
          return;
        } else if (updatedUser?.status === "inactive") {
          showAlert({
            message: "Tu solicitud ha sido rechazada o suspendida por la administración.",
            type: "error",
          });
        } else {
          showAlert({
            message: "Tu solicitud continúa en proceso de revisión por el Administrador.",
            type: "info",
          });
        }
      } else {
        showAlert({
          message: "No se pudo actualizar el estado de tu cuenta.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
      hide();
    }
  };

  const handleLogout = () => {
    authContext.logOut();
  };

  const userName = authContext.user?.names
    ? `${authContext.user.names} ${authContext.user.lastNames || ""}`.trim()
    : "Usuario";

  return {
    userName,
    isRefreshing,
    handleCheckStatus,
    handleLogout,
  };
}
