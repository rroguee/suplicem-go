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

  const refreshSupport = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSupportConfig();
      if (data) {
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
      }
    } catch (error) {
      console.warn("[SupportConfig] Usando valores por defecto:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      refreshSupport();
    }
  }, [autoFetch, refreshSupport]);

  return { supportConfig, isLoading, refreshSupport };
};
