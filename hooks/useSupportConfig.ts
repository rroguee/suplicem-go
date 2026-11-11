import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SUPPORT_CONFIG,
  getSupportConfig,
  SupportConfigPayload,
} from "@/services/configService";

/**
 * Consulta la configuración oficial de soporte con fallback seguro.
 */
export const useSupportConfig = (autoFetch = true) => {
  const [supportConfig, setSupportConfig] =
    useState<SupportConfigPayload>(DEFAULT_SUPPORT_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSupport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSupportConfig();
      setSupportConfig({
        whatsapp: data.whatsapp || DEFAULT_SUPPORT_CONFIG.whatsapp,
        whatsappMessage:
          data.whatsappMessage || DEFAULT_SUPPORT_CONFIG.whatsappMessage,
        phone: data.phone || DEFAULT_SUPPORT_CONFIG.phone,
        email: data.email || DEFAULT_SUPPORT_CONFIG.email,
        scheduleWeekday:
          data.scheduleWeekday || DEFAULT_SUPPORT_CONFIG.scheduleWeekday,
        scheduleSaturday:
          data.scheduleSaturday || DEFAULT_SUPPORT_CONFIG.scheduleSaturday,
        scheduleSunday:
          data.scheduleSunday || DEFAULT_SUPPORT_CONFIG.scheduleSunday,
      });
    } catch (err: any) {
      const message =
        err?.message || "No se pudo consultar la configuración de soporte.";
      console.warn("[SupportConfig] Usando valores por defecto:", message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      refreshSupport();
    }
  }, [autoFetch, refreshSupport]);

  return { supportConfig, isLoading, error, refreshSupport };
};
