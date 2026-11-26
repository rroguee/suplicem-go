import { User } from "@/types/users";
import { Order } from "@/types/orders";

/**
 * Determina si una orden califica como venta/orden asistida.
 */
export function isAssistedOrder(order?: Order | null): boolean {
  if (!order) return false;
  return Boolean(
    order.isAssisted ||
    order.createdByRole ||
    order.createdBySellerId ||
    order.createdByAdminId
  );
}

/**
 * Determina si el usuario actualmente autenticado es el autor/perpetrador
 * del pedido asistido.
 * 
 * Regla antifraude: Si el usuario actual es el autor, NO debe ver avisos 
 * o banners de asistencia (esos avisos son exclusivamente para terceros: 
 * el cliente, otros administradores auditores o el vendedor asignado).
 */
export function isAssistedOrderCreator(user?: User | null, order?: Order | null): boolean {
  if (!user || !order || !isAssistedOrder(order)) return false;

  const currentUid = user.uid?.trim();
  const sellerCreatorId = order.createdBySellerId?.trim();
  const adminCreatorId = order.createdByAdminId?.trim();

  // 1. Verificación estricta por UID (Aplica tanto a Administrador como a Vendedor)
  if (currentUid && (currentUid === sellerCreatorId || currentUid === adminCreatorId)) {
    return true;
  }

  // 2. Verificación de respaldo por teléfono
  const cleanUserPhone = (user.phone || "").replace(/\D/g, "");
  const cleanOrderPhone = (order.createdByPhone || "").replace(/\D/g, "");
  if (cleanUserPhone && cleanOrderPhone && cleanUserPhone === cleanOrderPhone) {
    return true;
  }

  // 3. Verificación de respaldo por nombre completo
  const userFullName = `${user.names || ""} ${user.lastNames || ""}`.trim().toLowerCase();
  const creatorName = (order.createdByName || "").trim().toLowerCase();
  if (userFullName && creatorName && userFullName === creatorName) {
    return true;
  }

  return false;
}
