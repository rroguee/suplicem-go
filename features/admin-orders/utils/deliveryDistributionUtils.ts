import { DeliveryDetail as OrderDelivery, Order } from "@/types/orders";

/**
 * Distribuye equitativamente la cantidad total de un producto entre N entregas
 * asegurando múltiplos de step (50 para cemento) y que la suma sea exacta.
 */
export function distributeEquitably(totalQty: number, count: number, step = 50): number[] {
  if (count <= 0) return [];
  if (count === 1) return [totalQty];

  const rawPerDelivery = Math.floor(totalQty / count);
  const baseQty = Math.max(step, Math.floor(rawPerDelivery / step) * step);
  const result: number[] = Array(count).fill(baseQty);
  let currentSum = baseQty * count;
  let remaining = totalQty - currentSum;

  let i = 0;
  while (remaining >= step) {
    result[i % count] += step;
    remaining -= step;
    i++;
  }
  if (remaining > 0) {
    result[0] += remaining;
  }
  return result;
}

/**
 * Redistribuye equitativamente las fundas de todas las entregas que comparten el mismo producto
 */
export function redistributeEquitably(
  deliveries: OrderDelivery[],
  order: Order | null | undefined
): OrderDelivery[] {
  if (!order || deliveries.length === 0) return deliveries;

  const productIds = Array.from(
    new Set(deliveries.map((d) => d.productId || order.items?.[0]?.productId || ""))
  );
  let updated = [...deliveries];

  for (const prodId of productIds) {
    if (!prodId) continue;
    const orderItem = order.items?.find((it) => it.productId === prodId);
    const totalOrdered = orderItem?.quantity || 0;
    const matchingIndices = updated
      .map((d, idx) => (d.productId === prodId ? idx : -1))
      .filter((idx) => idx !== -1);

    if (matchingIndices.length === 0 || totalOrdered <= 0) continue;

    const isCement = (orderItem?.name || "").toLowerCase().includes("cemento");
    const step = isCement ? 50 : 1;
    const distributed = distributeEquitably(totalOrdered, matchingIndices.length, step);

    matchingIndices.forEach((delIdx, i) => {
      updated[delIdx] = {
        ...updated[delIdx],
        quantity: distributed[i] || 0,
      };
    });
  }

  return updated;
}
