import { useContext, useState } from "react";
import { AuthContext } from "@/context/authContext";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { updateClientProfile } from "@/services/userService";
import { Address } from "@/types/users";

export const useClientSettings = () => {
  const { user, logOut, logIn } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { show, hide } = useLoading();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
  const [isSupportModalVisible, setIsSupportModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [phone, setPhone] = useState(user?.phone || "");
  const [addresses, setAddresses] = useState<Address[]>(user?.addresses || []);
  const [prevUserId, setPrevUserId] = useState<string | null>(user?.uid || null);

  if (user?.uid && user.uid !== prevUserId) {
    setPrevUserId(user.uid);
    setPhone(user.phone || "");
    setAddresses(user.addresses || []);
  }

  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalVisible(false);
    logOut();
  };

  const handleEdit = async () => {
    if (isEditing) {
      if (!user) {
        showAlert({
          message: "No se puede guardar, el usuario no está disponible.",
          type: "error",
        });
        return;
      }
      try {
        show();
        const validAddresses = addresses.filter(
          (addr) => addr && typeof addr.description === "string" && addr.description.trim().length > 0
        );

        await updateClientProfile(user.uid, phone.trim(), validAddresses);

        const newUser = {
          ...user,
          phone: phone.trim(),
          addresses: validAddresses,
        };

        logIn(newUser);
        setAddresses(validAddresses);
        showAlert({
          message: "¡Perfil y direcciones actualizadas con éxito!",
          type: "success",
        });
        setIsEditing(false);
      } catch (error: any) {
        console.error("Error al actualizar el cliente:", error.response?.data || error);
        const serverError =
          error?.response?.data?.message ||
          error?.response?.data?.errors?.[0]?.message ||
          error?.message ||
          "No se pudo actualizar el perfil. Inténtelo de nuevo.";
        showAlert({
          message: serverError,
          type: "error",
        });
      } finally {
        hide();
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setPhone(user.phone || "");
      setAddresses(user.addresses || []);
    }
  };

  const fullName = `${user?.names || ""} ${user?.lastNames || ""}`.trim() || "Cliente Registrado";

  return {
    user,
    fullName,
    phone,
    setPhone,
    addresses,
    setAddresses,
    isEditing,
    setIsEditing,
    isLogoutModalVisible,
    setIsLogoutModalVisible,
    isTermsModalVisible,
    setIsTermsModalVisible,
    isSupportModalVisible,
    setIsSupportModalVisible,
    handleLogout,
    confirmLogout,
    handleEdit,
    handleCancel,
  };
};
