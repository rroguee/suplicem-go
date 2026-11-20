import React from "react";
import { Order } from "@/types/orders";
import { Trip } from "@/types/trips";
import { DriverSelectionModal } from "./DriverSelectionModal";
import { DispatchFractionalTripModal } from "./DispatchFractionalTripModal";
import { RejectOrderModal } from "./RejectOrderModal";
import { ReceiptViewerModal } from "./ReceiptViewerModal";
import { AddDeliveryAddressModal } from "./AddDeliveryAddressModal";
import { OrderTripPlannerModal, PlannedTripItem } from "./OrderTripPlannerModal";

interface AdminOrderDetailModalsProps {
  currentOrder: Order;
  availableToDispatch: number;
  drivers: any[];
  allTrips: Trip[];
  orderTrips: Trip[];
  isDispatching: boolean;
  dispatchNextTrip: (tons: number, drvId?: string) => void;
  fractionalModalVisible: boolean;
  setFractionalModalVisible: (v: boolean) => void;
  plannerModalVisible: boolean;
  setPlannerModalVisible: (v: boolean) => void;
  tripToSplitDirectly: Trip | null;
  setTripToSplitDirectly: (t: Trip | null) => void;
  handleConfirmPlan: (plannedTrips: PlannedTripItem[]) => Promise<void>;
  rejectModalVisible: boolean;
  setRejectModalVisible: (v: boolean) => void;
  declineReason: string;
  setDeclineReason: (v: string) => void;
  rejectOrder: () => void;
  viewReceiptModalVisible: boolean;
  setViewReceiptModalVisible: (v: boolean) => void;
  isAddingNewAddress: boolean;
  setIsAddingNewAddress: (v: boolean) => void;
  newAddressData: any;
  setNewAddressData: (v: any) => void;
  documentTypeOptions: any;
  handleAddNewAddress: () => void;
  tripDriverModalVisible: boolean;
  setTripDriverModalVisible: (v: boolean) => void;
  targetTripForDriver: Trip | null;
  setTargetTripForDriver: (t: Trip | null) => void;
  onSelectTripDriver: (drvId: string) => void;
}

export const AdminOrderDetailModals: React.FC<AdminOrderDetailModalsProps> = ({
  currentOrder,
  availableToDispatch,
  drivers,
  allTrips,
  orderTrips,
  isDispatching,
  dispatchNextTrip,
  fractionalModalVisible,
  setFractionalModalVisible,
  plannerModalVisible,
  setPlannerModalVisible,
  tripToSplitDirectly,
  setTripToSplitDirectly,
  handleConfirmPlan,
  rejectModalVisible,
  setRejectModalVisible,
  declineReason,
  setDeclineReason,
  rejectOrder,
  viewReceiptModalVisible,
  setViewReceiptModalVisible,
  isAddingNewAddress,
  setIsAddingNewAddress,
  newAddressData,
  setNewAddressData,
  documentTypeOptions,
  handleAddNewAddress,
  tripDriverModalVisible,
  setTripDriverModalVisible,
  targetTripForDriver,
  setTargetTripForDriver,
  onSelectTripDriver,
}) => {
  return (
    <>
      <DispatchFractionalTripModal
        visible={fractionalModalVisible}
        onClose={() => setFractionalModalVisible(false)}
        order={currentOrder}
        availableToDispatch={availableToDispatch}
        drivers={drivers}
        allTrips={allTrips}
        onConfirm={(tons, drvId) => {
          dispatchNextTrip(tons, drvId);
          setFractionalModalVisible(false);
        }}
        isDispatching={isDispatching}
      />

      <OrderTripPlannerModal
        visible={plannerModalVisible}
        onClose={() => {
          setPlannerModalVisible(false);
          setTripToSplitDirectly(null);
        }}
        order={currentOrder}
        totalAvailableTons={
          tripToSplitDirectly
            ? Number(tripToSplitDirectly.totalTons) || 0
            : Number(currentOrder.totalTons || currentOrder.pendingBalance) || 0
        }
        drivers={drivers}
        allTrips={allTrips}
        existingOrderTrips={tripToSplitDirectly ? undefined : orderTrips}
        onConfirmPlan={handleConfirmPlan}
        isSaving={isDispatching}
        title={
          tripToSplitDirectly
            ? `Fraccionar Viaje ${tripToSplitDirectly.tripNumber}`
            : undefined
        }
        isSingleTripSplit={Boolean(tripToSplitDirectly)}
        initialDriverId={tripToSplitDirectly?.assignedDriverId}
      />

      <RejectOrderModal
        visible={rejectModalVisible}
        declineReason={declineReason}
        onDeclineReasonChange={setDeclineReason}
        onConfirm={rejectOrder}
        onCancel={() => {
          setRejectModalVisible(false);
          setDeclineReason("");
        }}
      />

      <ReceiptViewerModal
        visible={viewReceiptModalVisible}
        imageUrl={currentOrder.receiptImage}
        onClose={() => setViewReceiptModalVisible(false)}
      />

      <AddDeliveryAddressModal
        visible={isAddingNewAddress}
        newAddressData={newAddressData}
        documentTypeOptions={documentTypeOptions}
        setNewAddressData={setNewAddressData}
        onSave={handleAddNewAddress}
        onCancel={() => {
          setIsAddingNewAddress(false);
          setNewAddressData({
            placeId: "",
            description: "",
            latitude: 0,
            longitude: 0,
            recipientName: "",
            recipientDocument: "",
            recipientDocumentType: "Cédula",
            userUid: "",
            additionalInfo: "",
          });
        }}
      />

      <DriverSelectionModal
        visible={tripDriverModalVisible}
        onClose={() => {
          setTripDriverModalVisible(false);
          setTargetTripForDriver(null);
        }}
        order={currentOrder}
        targetTons={Number(targetTripForDriver?.totalTons) || availableToDispatch}
        drivers={drivers}
        allTrips={allTrips}
        selectedDriverId={targetTripForDriver?.assignedDriverId || ""}
        onSelectDriver={onSelectTripDriver}
      />
    </>
  );
};

export default AdminOrderDetailModals;
