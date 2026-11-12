import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { getOrderDetail, approveOrder } from "@/services/orderService";
import { splitOrderTrips } from "@/services/tripsService";
import { getUsers } from "@/services/userService";
import { Order } from "@/types/orders";
import { User } from "@/types/users";
import { ROLE } from "@/constants/UserConstants";
import { TruckTripItem } from "../components/approval/TripTruckRow";

export interface DeliveryPlanState {
  id?: string;
  index: number;
  addressDescription: string;
  recipientName?: string;
  destinationAddress?: any;
  quantityFundas: number;
  totalTons: number;
  trucks: TruckTripItem[];
}

export function useOrderApprovalPlanner(orderId: string) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { show, hide } = useLoading();

  const [order, setOrder] = useState<Order | null>(null);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveriesPlan, setDeliveriesPlan] = useState<DeliveryPlanState[]>([]);

  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const [activeDriverTarget, setActiveDriverTarget] = useState<{
    deliveryIndex: number;
    truckId: string;
    tons: number;
    currentDriverId?: string;
  } | null>(null);

  const [receiptModalVisible, setReceiptModalVisible] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [orderRes, usersRes] = await Promise.all([
          getOrderDetail(orderId),
          getUsers(),
        ]);

        const orderData: Order = orderRes.order || orderRes.data || orderRes;
        setOrder(orderData);

        const allUsers: User[] = Array.isArray(usersRes) ? usersRes : usersRes.users || [];
        setDrivers(allUsers.filter((u) => u.userType === ROLE.DRIVER));

        const totalItemsQty = (orderData.items || []).reduce(
          (sum, item) => sum + (Number(item.quantity) || 0),
          0
        );

        const rawDeliveries = (orderData.deliveries && orderData.deliveries.length > 0)
          ? orderData.deliveries
          : [
              {
                id: "del-main",
                productId: orderData.items?.[0]?.productId || "",
                address: orderData.deliveryAddress,
                quantity: totalItemsQty,
                unit: orderData.items?.[0]?.unit || "fundas",
              },
            ];

        const orderTotalTons = Number(orderData.totalTons || orderData.pendingBalance) || 0;
        const rawEstimatedTons = rawDeliveries.map((del) => {
          const qty = Number(del.quantity) || 0;
          const matchedItem = orderData.items?.find((i) => i.productId === del.productId);
          const weightKg = del.weightKg || matchedItem?.weightKg || 42.5;
          return (qty * weightKg) / 1000;
        });
        const totalEstimated = rawEstimatedTons.reduce((sum, t) => sum + t, 0);

        let accumulatedTons = 0;
        const initialPlan: DeliveryPlanState[] = rawDeliveries.map((del, idx) => {
          const qtyFundas = Number(del.quantity) || 0;
          let tons: number;
          if (orderTotalTons > 0) {
            if (idx === rawDeliveries.length - 1) {
              tons = Number(Math.max(0, orderTotalTons - accumulatedTons).toFixed(2));
            } else if (totalEstimated > 0) {
              tons = Number(((rawEstimatedTons[idx] / totalEstimated) * orderTotalTons).toFixed(2));
            } else {
              tons = Number((orderTotalTons / rawDeliveries.length).toFixed(2));
            }
            accumulatedTons += tons;
          } else {
            tons = Number(rawEstimatedTons[idx].toFixed(2));
          }

          const addressDesc = del.address?.description || "Dirección de orden";
          const truckCount = Math.max(1, Math.ceil(tons / 21));
          const tonsPerTruck = Number((tons / truckCount).toFixed(2));

          const trucks: TruckTripItem[] = Array.from({ length: truckCount }, (_, tIdx) => ({
            id: `truck-${idx}-${tIdx}-${Date.now()}`,
            totalTons: tIdx === truckCount - 1 ? Number((tons - tonsPerTruck * (truckCount - 1)).toFixed(2)) : tonsPerTruck,
            deliveryId: del.id,
          }));

          return {
            id: del.id,
            index: idx,
            addressDescription: addressDesc,
            recipientName: del.address?.recipientName,
            destinationAddress: del.address,
            quantityFundas: qtyFundas,
            totalTons: tons,
            trucks,
          };
        });

        setDeliveriesPlan(initialPlan);
      } catch (err: any) {
        console.error("Error al cargar orden para aprobación:", err);
        showAlert({ message: "No se pudo cargar la orden.", type: "error" });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [orderId]);

  const handleUpdateTruckTons = (delIdx: number, truckId: string, tons: number) => {
    setDeliveriesPlan((prev) =>
      prev.map((del, i) => (i !== delIdx ? del : {
        ...del,
        trucks: del.trucks.map((t) => (t.id === truckId ? { ...t, totalTons: tons } : t)),
      }))
    );
  };

  const handleAddTruck = (delIdx: number) => {
    setDeliveriesPlan((prev) =>
      prev.map((del, i) => (i !== delIdx ? del : {
        ...del,
        trucks: [...del.trucks, { id: `truck-${delIdx}-${del.trucks.length}-${Date.now()}`, totalTons: 10, deliveryId: del.id }],
      }))
    );
  };

  const handleRemoveTruck = (delIdx: number, truckId: string) => {
    setDeliveriesPlan((prev) =>
      prev.map((del, i) => (i !== delIdx || del.trucks.length <= 1 ? del : {
        ...del,
        trucks: del.trucks.filter((t) => t.id !== truckId),
      }))
    );
  };

  const handleOpenDriverModal = (delIdx: number, truck: TruckTripItem) => {
    setActiveDriverTarget({
      deliveryIndex: delIdx,
      truckId: truck.id,
      tons: truck.totalTons,
      currentDriverId: truck.driverId,
    });
    setDriverModalVisible(true);
  };

  const handleSelectDriver = (driverId: string) => {
    if (!activeDriverTarget) return;
    const selectedDriver = drivers.find((d) => d.uid === driverId);
    const driverName = selectedDriver ? `${selectedDriver.names || ""} ${selectedDriver.lastNames || ""}`.trim() : undefined;

    setDeliveriesPlan((prev) =>
      prev.map((del, i) => (i !== activeDriverTarget.deliveryIndex ? del : {
        ...del,
        trucks: del.trucks.map((t) => (t.id === activeDriverTarget.truckId ? { ...t, driverId: driverId || undefined, driverName } : t)),
      }))
    );
    setDriverModalVisible(false);
  };

  const handleConfirmApproval = async () => {
    if (!order) return;

    const isPickup = order.deliveryType === "almacen";

    if (!isPickup) {
      for (const del of deliveriesPlan) {
        const planned = del.trucks.reduce((sum, t) => sum + (Number(t.totalTons) || 0), 0);
        if (Math.abs(planned - del.totalTons) > 0.1) {
          showAlert({
            message: `La Entrega #${del.index + 1} tiene ${planned.toFixed(2)} t planificadas pero requiere ${del.totalTons.toFixed(2)} t. Por favor equilibra los camiones.`,
            type: "warning",
          });
          return;
        }
      }
    }

    const allTrips = isPickup
      ? []
      : deliveriesPlan.flatMap((del) =>
          del.trucks.map((truck, tIdx) => ({
            totalTons: Number(truck.totalTons.toFixed(2)),
            driverId: truck.driverId,
            deliveryId: del.id,
            destinationAddress: del.destinationAddress,
            comments: `Viaje Camión #${tIdx + 1} para Entrega #${del.index + 1} (${del.addressDescription})`,
          }))
        );

    try {
      show();
      const appRes = await approveOrder(order.id!);
      if (!appRes.success && appRes.message?.includes("ya aprobada") === false) {
        throw new Error(appRes.message || "Error al aprobar la orden");
      }
      if (!isPickup) {
        const splitRes = await splitOrderTrips(order.id!, allTrips);
        if (!splitRes.success) {
          throw new Error(splitRes.message || "Error al generar los viajes fraccionados");
        }
      }
      showAlert({
        message: isPickup
          ? "¡Orden de retiro en almacén aprobada correctamente!"
          : "¡Orden aprobada y viajes generados correctamente!",
        type: "success",
      });
      router.back();
    } catch (err: any) {
      console.error("Error al aprobar orden y generar viajes:", err);
      showAlert({ message: err.message || "Ocurrió un error al procesar la aprobación.", type: "error" });
    } finally {
      hide();
    }
  };

  return {
    order,
    drivers,
    loading,
    deliveriesPlan,
    driverModalVisible,
    setDriverModalVisible,
    activeDriverTarget,
    receiptModalVisible,
    setReceiptModalVisible,
    handleAddTruck,
    handleRemoveTruck,
    handleUpdateTruckTons,
    handleOpenDriverModal,
    handleSelectDriver,
    handleConfirmApproval,
  };
}
