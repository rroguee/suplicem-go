import { useState, useMemo } from "react";
import { Order } from "@/types/orders";
import { Trip } from "@/types/trips";
import { PlannedTripItem } from "../components/OrderTripPlannerModal";

interface UseAdminOrderStagingProps {
  currentOrder: Order | null | undefined;
  orderTrips: Trip[];
  isEditing: boolean;
  handleSave: (opts?: { silent?: boolean }) => Promise<boolean>;
  handleCancel: () => void;
  splitSpecificTrip: (
    tripId: string,
    subTrips: PlannedTripItem[],
    silent?: boolean
  ) => Promise<boolean>;
  planAndSplitTrips: (
    plannedTrips: PlannedTripItem[],
    silent?: boolean
  ) => Promise<boolean>;
  assignDriverToTrip: (
    tripId: string,
    driverId: string,
    silent?: boolean
  ) => Promise<boolean>;
  showAlert: (alert: {
    message: string;
    type: "success" | "error" | "info" | "warning";
  }) => void;
}

export const useAdminOrderStaging = ({
  currentOrder,
  orderTrips,
  isEditing,
  handleSave,
  handleCancel,
  splitSpecificTrip,
  planAndSplitTrips,
  assignDriverToTrip,
  showAlert,
}: UseAdminOrderStagingProps) => {
  const [pendingSingleTripSplits, setPendingSingleTripSplits] = useState<
    Array<{ tripId: string; subTrips: PlannedTripItem[] }>
  >([]);
  const [pendingDriverAssignments, setPendingDriverAssignments] = useState<
    Record<string, string>
  >({});
  const [pendingAllTripsPlan, setPendingAllTripsPlan] = useState<
    PlannedTripItem[] | null
  >(null);
  const [isTripSaving, setIsTripSaving] = useState(false);

  // Previsualización de viajes en pantalla según los cambios provisionales
  const displayedOrderTrips = useMemo(() => {
    if (!isEditing) return orderTrips;

    if (pendingAllTripsPlan && pendingAllTripsPlan.length > 0) {
      return pendingAllTripsPlan.map((pt, idx) => ({
        id: `staged-all-${idx}`,
        tripNumber: `TRIP-${currentOrder?.orderNumber || "ORD"}-${idx + 1}`,
        totalTons: pt.totalTons,
        assignedDriverId: pt.driverId,
        status: pt.driverId ? "assigned" : "available",
        orderIds: [currentOrder?.id || ""],
        createdAt: new Date().toISOString(),
      })) as Trip[];
    }

    let result = [...orderTrips];

    result = result.map((t) => {
      if (t.id && pendingDriverAssignments[t.id]) {
        return {
          ...t,
          assignedDriverId: pendingDriverAssignments[t.id],
          status: "assigned",
        };
      }
      return t;
    });

    for (const split of pendingSingleTripSplits) {
      const idx = result.findIndex((t) => t.id === split.tripId);
      if (idx !== -1) {
        const orig = result[idx];
        const newSubTrips: Trip[] = split.subTrips.map((st, sIdx) => ({
          id: `staged-${split.tripId}-${sIdx}`,
          tripNumber: `${orig.tripNumber}-${String.fromCharCode(65 + sIdx)}`,
          totalTons: st.totalTons,
          assignedDriverId: st.driverId || undefined,
          status: st.driverId ? "assigned" : "available",
          orderIds: orig.orderIds,
          createdAt: new Date().toISOString(),
        }));
        result.splice(idx, 1, ...newSubTrips);
      }
    }

    return result;
  }, [
    orderTrips,
    isEditing,
    pendingAllTripsPlan,
    pendingDriverAssignments,
    pendingSingleTripSplits,
    currentOrder?.orderNumber,
    currentOrder?.id,
  ]);

  const handleCancelAll = () => {
    setPendingSingleTripSplits([]);
    setPendingDriverAssignments({});
    setPendingAllTripsPlan(null);
    handleCancel();
  };

  const handleSaveAll = async () => {
    setIsTripSaving(true);
    let allOk = true;
    try {
      const deliveryOk = await handleSave({ silent: true });
      if (!deliveryOk) allOk = false;

      if (pendingSingleTripSplits.length > 0) {
        for (const item of pendingSingleTripSplits) {
          const splitOk = await splitSpecificTrip(item.tripId, item.subTrips, true);
          if (!splitOk) allOk = false;
        }
        if (allOk) setPendingSingleTripSplits([]);
      }

      if (pendingAllTripsPlan) {
        const planOk = await planAndSplitTrips(pendingAllTripsPlan, true);
        if (planOk) setPendingAllTripsPlan(null);
        else allOk = false;
      }

      for (const [tId, dId] of Object.entries(pendingDriverAssignments)) {
        const assignOk = await assignDriverToTrip(tId, dId, true);
        if (!assignOk) allOk = false;
      }
      if (allOk) setPendingDriverAssignments({});

      if (allOk) {
        showAlert({
          message: "Cambios guardados correctamente.",
          type: "success",
        });
      }
    } finally {
      setIsTripSaving(false);
    }
  };

  return {
    displayedOrderTrips,
    isTripSaving,
    pendingSingleTripSplits,
    setPendingSingleTripSplits,
    pendingDriverAssignments,
    setPendingDriverAssignments,
    pendingAllTripsPlan,
    setPendingAllTripsPlan,
    handleSaveAll,
    handleCancelAll,
  };
};

export default useAdminOrderStaging;
