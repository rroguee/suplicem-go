import { useEffect, useState } from "react";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { updateOwnProfile, UpdateOwnProfilePayload } from "@/services/userService";

interface EditableAccountUser {
  uid?: string;
  names?: string;
  lastNames?: string;
  phone?: string;
}

interface UseEditAccountFormProps {
  visible: boolean;
  user: EditableAccountUser | null;
  onSuccess: (updated: UpdateOwnProfilePayload) => void;
  onClose: () => void;
}

/**
 * Maneja el estado local, validación y envío del formulario de edición de cuenta propia.
 */
export const useEditAccountForm = ({
  visible,
  user,
  onSuccess,
  onClose,
}: UseEditAccountFormProps) => {
  const { showAlert } = useAlert();
  const { show, hide } = useLoading();

  const [names, setNames] = useState(user?.names || "");
  const [lastNames, setLastNames] = useState(user?.lastNames || "");
  const [phone, setPhone] = useState(user?.phone || "");

  useEffect(() => {
    if (visible && user) {
      setNames(user.names || "");
      setLastNames(user.lastNames || "");
      setPhone(user.phone || "");
    }
  }, [visible, user]);

  const handleSave = async () => {
    if (!user?.uid) {
      showAlert({ message: "No se pudo identificar tu cuenta.", type: "error" });
      return;
    }

    const trimmed: UpdateOwnProfilePayload = {
      names: names.trim(),
      lastNames: lastNames.trim(),
      phone: phone.trim(),
    };

    if (!trimmed.names) {
      showAlert({ message: "El campo Nombres es obligatorio.", type: "warning" });
      return;
    }

    try {
      show();
      const result = await updateOwnProfile(user.uid, trimmed);
      if (!result.success) {
        showAlert({
          message: result.message || "No se pudo actualizar tu cuenta.",
          type: "error",
        });
        return;
      }

      onSuccess(trimmed);
      showAlert({ message: "¡Cuenta actualizada correctamente!", type: "success" });
      onClose();
    } catch (error) {
      console.error("[EditAccount] Error al guardar:", error);
      showAlert({ message: "Ocurrió un error al guardar los cambios.", type: "error" });
    } finally {
      hide();
    }
  };

  return { names, setNames, lastNames, setLastNames, phone, setPhone, handleSave };
};
