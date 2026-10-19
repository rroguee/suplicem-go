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
