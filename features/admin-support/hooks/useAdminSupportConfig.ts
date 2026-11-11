import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import {
  DEFAULT_SUPPORT_CONFIG,
  getSupportConfig,
  SupportConfigPayload,
  updateSupportConfig,
} from "@/services/configService";

/**
 * Maneja la carga, edición y actualización de la configuración de soporte.
 */
export const useAdminSupportConfig = () => {
  const [form, setForm] = useState<SupportConfigPayload>(DEFAULT_SUPPORT_CONFIG);
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const fetchConfig = useCallback(async () => {
    try {
      show();
      const data = await getSupportConfig();
      setForm({
        whatsapp: data.whatsapp || "",
        whatsappMessage: data.whatsappMessage || "",
        phone: data.phone || "",
        email: data.email || "",
        scheduleWeekday: data.scheduleWeekday || "",
        scheduleSaturday: data.scheduleSaturday || "",
        scheduleSunday: data.scheduleSunday || "",
      });
    } catch (error: any) {
      console.error("[AdminSupport] Error al cargar:", error);
      showAlert({
        message: error?.message || "No se pudo cargar la configuración de soporte.",
        type: "error",
      });
    } finally {
      hide();
    }
  }, [show, hide, showAlert]);

  useFocusEffect(
    useCallback(() => {
      fetchConfig();
    }, [fetchConfig])
  );

  const updateField = (key: keyof SupportConfigPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const trimmed: SupportConfigPayload = {
      whatsapp: form.whatsapp.trim(),
      whatsappMessage: form.whatsappMessage.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      scheduleWeekday: form.scheduleWeekday.trim(),
      scheduleSaturday: form.scheduleSaturday.trim(),
      scheduleSunday: form.scheduleSunday.trim(),
    };

    if (
      !trimmed.whatsapp ||
      !trimmed.phone ||
      !trimmed.email ||
      !trimmed.scheduleWeekday ||
      !trimmed.scheduleSaturday ||
      !trimmed.scheduleSunday
    ) {
      showAlert({
        message: "Completa todos los campos obligatorios de contacto y horario.",
        type: "warning",
      });
      return;
    }

    try {
      show();
      const result = await updateSupportConfig(trimmed);
      if (result.success) {
        setForm(trimmed);
        showAlert({
          message: "Configuración de soporte guardada correctamente.",
          type: "success",
        });
      } else {
        showAlert({
          message: result.message || "Error al guardar la configuración.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("[AdminSupport] Error al guardar:", error);
      showAlert({
        message: "Ocurrió un error al actualizar la configuración.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  return { form, updateField, handleSave, fetchConfig };
};
