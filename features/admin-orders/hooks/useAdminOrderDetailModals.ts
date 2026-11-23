import { useState } from "react";
import { Trip } from "@/types/trips";
import { PlannedTripItem } from "../components/OrderTripPlannerModal";

interface UseAdminOrderDetailModalsProps {
  isEditing: boolean;
  approveOrder: (tripsPlan?: PlannedTripItem[]) => Promise<void>;
  splitSpecificTrip: (tripId: string, subTrips: PlannedTripItem[]) => Promise<boolean>;
  planAndSplitTrips: (tripsPlan: PlannedTripItem[]) => Promise<boolean>;
  setPendingSingleTripSplits: React.Dispatch<React.SetStateAction<any[]>>;
  setPendingAllTripsPlan: (plan: PlannedTripItem[]) => void;
  setPendingDriverAssignments: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const useAdminOrderDetailModals = ({
  isEditing,
  approveOrder,
  splitSpecificTrip,
  planAndSplitTrips,
  setPendingSingleTripSplits,
  setPendingAllTripsPlan,
  setPendingDriverAssignments,
}: UseAdminOrderDetailModalsProps) => {
  const [fractionalModalVisible, setFractionalModalVisible] = useState(false);
  const [plannerModalVisible, setPlannerModalVisible] = useState(false);
  const [isApprovalPlanning, setIsApprovalPlanning] = useState(false);
  const [tripToSplitDirectly, setTripToSplitDirectly] = useState<Trip | null>(null);
  const [targetTripForDriver, setTargetTripForDriver] = useState<Trip | null>(null);
  const [tripDriverModalVisible, setTripDriverModalVisible] = useState(false);

  const handleAssignDriverToTrip = (tripToAssign: Trip) => {
    setTargetTripForDriver(tripToAssign);
    setTripDriverModalVisible(true);
  };

  const handleOpenPlanner = () => {
    setIsApprovalPlanning(false);
    setTripToSplitDirectly(null);
    setPlannerModalVisible(true);
  };

  const handleStartSplitSingleTrip = (tripToSplit: Trip) => {
    setIsApprovalPlanning(false);
    setTripToSplitDirectly(tripToSplit);
    setPlannerModalVisible(true);
  };

  const handleConfirmPlan = async (plannedTrips: PlannedTripItem[]) => {
    if (isApprovalPlanning) {
      await approveOrder(plannedTrips);
      setPlannerModalVisible(false);
    } else if (tripToSplitDirectly?.id) {
      if (isEditing) {
        setPendingSingleTripSplits((prev) => [
          ...prev.filter((p) => p.tripId !== tripToSplitDirectly.id),
          { tripId: tripToSplitDirectly.id!, subTrips: plannedTrips },
        ]);
        setPlannerModalVisible(false);
        setTripToSplitDirectly(null);
      } else {
        const ok = await splitSpecificTrip(tripToSplitDirectly.id, plannedTrips);
        if (ok) {
          setPlannerModalVisible(false);
          setTripToSplitDirectly(null);
        }
      }
    } else {
      if (isEditing) {
        setPendingAllTripsPlan(plannedTrips);
        setPlannerModalVisible(false);
      } else {
        const ok = await planAndSplitTrips(plannedTrips);
        if (ok) {
          setPlannerModalVisible(false);
        }
      }
    }
  };

  const handleSelectTripDriver = (drvId: string) => {
    if (targetTripForDriver?.id && drvId && isEditing) {
      setPendingDriverAssignments((prev) => ({
        ...prev,
        [targetTripForDriver.id!]: drvId,
      }));
    }
    setTripDriverModalVisible(false);
    setTargetTripForDriver(null);
  };

  return {
    fractionalModalVisible,
    setFractionalModalVisible,
    plannerModalVisible,
    setPlannerModalVisible,
    tripToSplitDirectly,
    setTripToSplitDirectly,
    targetTripForDriver,
    setTargetTripForDriver,
    tripDriverModalVisible,
    setTripDriverModalVisible,
    handleAssignDriverToTrip,
    handleOpenPlanner,
    handleStartSplitSingleTrip,
    handleConfirmPlan,
    handleSelectTripDriver,
  };
};
