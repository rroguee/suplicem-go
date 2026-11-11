import { safeRequest } from "./apiSafe";
import protectedApi from "./protectedApi";

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'current';
  currency: string;
  routingNumber?: string;
  swiftCode?: string;
  isActive: boolean;
  createdAt?: string;
  // Legacy fields
  rnc?: string;
  holder?: string;
}

export interface CreateBankAccountPayload {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'current';
  currency: string;
  routingNumber?: string;
  swiftCode?: string;
}

export const getBankAccounts = async (): Promise<BankAccount[]> => {
  const result = await safeRequest(() => protectedApi.get("/bank-accounts"));
  if (result.success && result.data) {
    // Soporta tanto array directo como { bankAccounts: [] }
    return Array.isArray(result.data)
      ? (result.data as BankAccount[])
      : (result.data.bankAccounts || []) as BankAccount[];
  }
  return [];
};

export const createBankAccount = async (
  payload: CreateBankAccountPayload
): Promise<{ success: boolean; id?: string; message?: string }> => {
  const result = await safeRequest(() => protectedApi.post("/bank-accounts", payload));
  return result.success
    ? { success: true, id: result.data?.id }
    : { success: false, message: result.message };
};

export const updateBankAccount = async (
  id: string,
  payload: Partial<CreateBankAccountPayload> & { isActive?: boolean }
): Promise<{ success: boolean; message?: string }> => {
  const result = await safeRequest(() =>
    protectedApi.patch(`/bank-accounts/${id}`, payload)
  );
  return result.success
    ? { success: true }
    : { success: false, message: result.message };
};

export const deleteBankAccount = async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  const result = await safeRequest(() =>
    protectedApi.delete(`/bank-accounts/${id}`)
  );
  return result.success
    ? { success: true }
    : { success: false, message: result.message };
};

export interface SupportConfig {
  whatsapp: string;
  whatsappMessage: string;
  phone: string;
  email: string;
  scheduleWeekday: string;
  scheduleSaturday: string;
  scheduleSunday: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type SupportConfigPayload = Omit<SupportConfig, "updatedAt" | "updatedBy">;

export const DEFAULT_SUPPORT_CONFIG: SupportConfigPayload = {
  whatsapp: "18095550199",
  whatsappMessage: "Hola, necesito asistencia con el sistema Suplicem",
  phone: "(809) 555-0199",
  email: "soporte@suplicem.com",
  scheduleWeekday: "8:00 AM - 6:00 PM",
  scheduleSaturday: "8:00 AM - 1:00 PM",
  scheduleSunday: "Guardias de contingencia",
};

export const getSupportConfig = async (): Promise<SupportConfig | null> => {
  const result = await safeRequest(() => protectedApi.get("/config/support"));
  if (result.success && result.data?.data) {
    return result.data.data as SupportConfig;
  }
  return null;
};

export const updateSupportConfig = async (
  payload: SupportConfigPayload
): Promise<{ success: boolean; message?: string }> => {
  const result = await safeRequest(() =>
    protectedApi.put("/config/support", payload)
  );
  return result.success
    ? { success: true }
    : { success: false, message: result.message };
};
