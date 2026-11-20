import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { getOrderDetail, approveOrder, getOrderDispatchPlan } from "@/services/orderService";
import { splitOrderTrips } from "@/services/tripsService";
import { getUsers } from "@/services/userService";
import { Order } from "@/types/orders";
import { User } from "@/types/users";
import { ROLE } from "@/constants/UserConstants";
import { TruckTripItem } from "../components/approval/TripTruckRow";
import {
  calculateTrucksOnAdd,
  rebalanceTrucksOnRemove,
} from "../utils/deliveryDistributionUtils";

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

        // Consultar el plan oficial precalculado por el backend
        const planRes = await getOrderDispatchPlan(orderId);
        if (planRes?.success && planRes?.plan?.deliveries) {
          setDeliveriesPlan(planRes.plan.deliveries);
        } else {
          // Fallback seguro de contingencia
          setDeliveriesPlan(
            rawDeliveries.map((del, idx) => ({
              id: del.id,
              index: idx,
              addressDescription: del.address?.description || "Dirección de orden",
              recipientName: del.address?.recipientName,
              destinationAddress: del.address,
              quantityFundas: Number(del.quantity) || 0,
              totalTons: 0,
              trucks: [{ id: `truck-${idx}-0-${Date.now()}`, totalTons: 0, deliveryId: del.id }],
            }))
          );
        }
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
      prev.map((del, i) =>
        i !== delIdx
          ? del
          : {
              ...del,
              trucks: calculateTrucksOnAdd(del.trucks, del.totalTons, del.id, delIdx),
            }
      )
    );
  };

  const handleRemoveTruck = (delIdx: number, truckId: string) => {
    setDeliveriesPlan((prev) =>
      prev.map((del, i) =>
        i !== delIdx || del.trucks.length <= 1
          ? del
          : {
              ...del,
              trucks: rebalanceTrucksOnRemove(del.trucks, del.totalTons, truckId),
            }
      )
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

      const hasUnassignedTrucks = deliveriesPlan.some((del) =>
        del.trucks.some((t) => !t.driverId)
      );
      if (hasUnassignedTrucks) {
        showAlert({
          message: "Debes asignar un conductor a cada camión antes de confirmar la aprobación.",
          type: "warning",
        });
        return;
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
