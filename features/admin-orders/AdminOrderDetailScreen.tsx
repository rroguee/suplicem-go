import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Trip } from "@/types/trips";
import { StatusBadge } from "@/components/StatusBadge";
import { useAlert } from "@/context/alertContext";
import { useAdminOrderDetail } from "./hooks/useAdminOrderDetail";
import { useDeliveryEditor } from "./hooks/useDeliveryEditor";
import { useAdminOrderStaging } from "./hooks/useAdminOrderStaging";
import { AdminOrderHeader } from "./components/AdminOrderHeader";
import { OrderFinancialSummary } from "./components/OrderFinancialSummary";
import { OrderDispatchCard } from "./components/OrderDispatchCard";
import { DeliveriesSection } from "./components/DeliveriesSection";
import { DriverAssignmentCard } from "./components/DriverAssignmentCard";
import { OrderTripsProgressCard } from "./components/OrderTripsProgressCard";
import { PlannedTripItem } from "./components/OrderTripPlannerModal";
import { PaymentReceiptCard } from "./components/PaymentReceiptCard";
import { WarehousePickupCard } from "./components/WarehousePickupCard";
import { AdminOrderDetailModals } from "./components/AdminOrderDetailModals";

export interface AdminOrderDetailScreenProps {
  orderId?: string;
}

export const AdminOrderDetailScreen: React.FC<AdminOrderDetailScreenProps> = ({
  orderId,
}) => {
  const router = useRouter();
  const {
    currentOrder,
    trip,
    users,
    drivers,
    allTrips,
    orderTrips,
    availableToDispatch,
    dispatchNextTrip,
    assignDriverToTrip,
    splitSpecificTrip,
    planAndSplitTrips,
    isDispatching,
    selectedDriverId,
    setSelectedDriverId,
    rejectModalVisible,
    setRejectModalVisible,
    viewReceiptModalVisible,
    setViewReceiptModalVisible,
    declineReason,
    setDeclineReason,
    approveOrder,
    rejectOrder,
    completePickup,
    refreshAll,
    setFreshOrder,
    updateOrder,
  } = useAdminOrderDetail(orderId);
  const { showAlert } = useAlert();

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAll();
    } finally {
      setRefreshing(false);
    }
  };

  const [fractionalModalVisible, setFractionalModalVisible] = useState(false);
  const [plannerModalVisible, setPlannerModalVisible] = useState(false);
  const [isApprovalPlanning, setIsApprovalPlanning] = useState(false);
  const [tripToSplitDirectly, setTripToSplitDirectly] = useState<Trip | null>(null);
  const [targetTripForDriver, setTargetTripForDriver] = useState<Trip | null>(null);
  const [tripDriverModalVisible, setTripDriverModalVisible] = useState(false);

  const {
    isEditing,
    isSaving,
    editedDeliveryType,
    setEditedDeliveryType,
    editedDeliveries,
    handleEdit,
    handleSave,
    handleCancel,
    updateDelivery,
    handleUserSelection,
    isAddingNewAddress,
    setIsAddingNewAddress,
    newAddressData,
    setNewAddressData,
    handleAddNewAddress,
    productOptions,
    documentTypeOptions,
  } = useDeliveryEditor(currentOrder, users, updateOrder, setFreshOrder);

  const {
    displayedOrderTrips,
    isTripSaving,
    setPendingSingleTripSplits,
    setPendingDriverAssignments,
    setPendingAllTripsPlan,
    handleSaveAll,
    handleCancelAll,
  } = useAdminOrderStaging({
    currentOrder,
    orderTrips,
    isEditing,
    handleSave,
    handleCancel,
    splitSpecificTrip,
    planAndSplitTrips,
    assignDriverToTrip,
    showAlert,
  });

  const handleAssignDriverToTrip = (tripToAssign: Trip) => {
    setTargetTripForDriver(tripToAssign);
    setTripDriverModalVisible(true);
  };

  const handleOpenPlanner = () => {
    setIsApprovalPlanning(false);
    setTripToSplitDirectly(null);
    setPlannerModalVisible(true);
  };

  const handleApprovePress = () => {
    if (!currentOrder?.id) return;
    if (currentOrder.deliveryType === "almacen") {
      approveOrder();
      return;
    }
    router.push({
      pathname: "/order-approval",
      params: { orderId: currentOrder.id },
    } as any);
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

  const handleStartSplitSingleTrip = (tripToSplit: Trip) => {
    setIsApprovalPlanning(false);
    setTripToSplitDirectly(tripToSplit);
    setPlannerModalVisible(true);
  };

  if (!currentOrder) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No se encontró información de la orden.</Text>
      </View>
    );
  }

  const isPendingOrRequested =
    currentOrder.status === "pending" || currentOrder.status === "requested";
  const isDelivery =
    currentOrder.deliveryType === "domicilio" ||
    editedDeliveryType === "domicilio";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#166534"]} />
        }
      >
        {/* 1. Cabecera y datos de contacto del cliente */}
        <AdminOrderHeader
          order={currentOrder}
          isEditing={isEditing}
          isSaving={isSaving || isTripSaving}
          editedDeliveryType={editedDeliveryType}
          setEditedDeliveryType={setEditedDeliveryType}
          onEdit={handleEdit}
          onSave={handleSaveAll}
          onCancel={handleCancelAll}
        />

        {/* 2. Resumen financiero y Productos */}
        <OrderFinancialSummary
          items={currentOrder.items || []}
          comments={currentOrder.comments}
          paymentMethod={currentOrder.paymentMethod}
          creditNote={currentOrder.creditNote}
        />

        {/* 3. Conductor y vehículo asignado (si existe despacho) */}
        {trip?.driver && <OrderDispatchCard driver={trip.driver} />}

        {/* 4. Entregas / Repartos */}
        <DeliveriesSection
          order={currentOrder}
          users={users}
          isEditing={isEditing}
          editedDeliveryType={editedDeliveryType}
          editedDeliveries={editedDeliveries}
          productOptions={productOptions}
          onUpdateDelivery={updateDelivery}
          onUserSelection={handleUserSelection}
          onOpenNewAddressModal={() => setIsAddingNewAddress(true)}
        />

        {/* 5. Estado de la Orden */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de la orden</Text>
          <StatusBadge status={currentOrder.status} />
          {Boolean(currentOrder.rejectionReason || currentOrder.declineReason) && (
            <Text style={styles.declineReasonText}>
              Motivo de rechazo: {currentOrder.rejectionReason || currentOrder.declineReason}
            </Text>
          )}
        </View>

        {/* 6. Comprobante de Pago */}
        <PaymentReceiptCard
          receiptImage={currentOrder.receiptImage}
          comments={currentOrder.comments}
          onViewReceipt={() => setViewReceiptModalVisible(true)}
        />

        {/* 7. Progreso de Viajes y Despachos Simultáneos */}
        {isDelivery && (
          <OrderTripsProgressCard
            order={currentOrder}
            orderTrips={displayedOrderTrips}
            availableToDispatch={availableToDispatch}
            onDispatchNextTrip={() => setFractionalModalVisible(true)}
            isDispatching={isDispatching}
            drivers={drivers}
            onAssignDriverToTrip={handleAssignDriverToTrip}
            onCancelAndResplitTrip={handleStartSplitSingleTrip}
            onOpenPlanner={handleOpenPlanner}
            isEditing={isEditing}
          />
        )}

        {/* 8. Asignación de Conductor Específico para Aprobación Inicial */}
        {isPendingOrRequested && !isEditing && isDelivery && (
          <DriverAssignmentCard
            order={currentOrder}
            drivers={drivers}
            allTrips={allTrips}
            selectedDriverId={selectedDriverId}
            onSelectDriver={setSelectedDriverId}
          />
        )}

        {/* 9. Botones de Aprobación / Rechazo */}
        {!isEditing && isPendingOrRequested && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={handleApprovePress}
            >
              <Text style={styles.buttonText}>Aprobar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => setRejectModalVisible(true)}
            >
              <Text style={styles.buttonText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 10. Acciones para Retiro en Almacén */}
        <WarehousePickupCard
          status={currentOrder.status}
          isDelivery={isDelivery}
          isEditing={isEditing}
          onCompletePickup={completePickup}
        />

        {/* Modales desacoplados */}
        <AdminOrderDetailModals
          currentOrder={currentOrder}
          availableToDispatch={availableToDispatch}
          drivers={drivers}
          allTrips={allTrips}
          orderTrips={orderTrips}
          isDispatching={isDispatching}
          dispatchNextTrip={dispatchNextTrip}
          fractionalModalVisible={fractionalModalVisible}
          setFractionalModalVisible={setFractionalModalVisible}
          plannerModalVisible={plannerModalVisible}
          setPlannerModalVisible={setPlannerModalVisible}
          tripToSplitDirectly={tripToSplitDirectly}
          setTripToSplitDirectly={setTripToSplitDirectly}
          handleConfirmPlan={handleConfirmPlan}
          rejectModalVisible={rejectModalVisible}
          setRejectModalVisible={setRejectModalVisible}
          declineReason={declineReason}
          setDeclineReason={setDeclineReason}
          rejectOrder={rejectOrder}
          viewReceiptModalVisible={viewReceiptModalVisible}
          setViewReceiptModalVisible={setViewReceiptModalVisible}
          isAddingNewAddress={isAddingNewAddress}
          setIsAddingNewAddress={setIsAddingNewAddress}
          newAddressData={newAddressData}
          setNewAddressData={setNewAddressData}
          documentTypeOptions={documentTypeOptions}
          handleAddNewAddress={handleAddNewAddress}
          tripDriverModalVisible={tripDriverModalVisible}
          setTripDriverModalVisible={setTripDriverModalVisible}
          targetTripForDriver={targetTripForDriver}
          setTargetTripForDriver={setTargetTripForDriver}
          onSelectTripDriver={(drvId) => {
            if (targetTripForDriver?.id && drvId && isEditing) {
              setPendingDriverAssignments((prev) => ({
                ...prev,
                [targetTripForDriver.id!]: drvId,
              }));
            }
            setTripDriverModalVisible(false);
            setTargetTripForDriver(null);
          }}
        />
      </ScrollView>

      {/* Barra de acción fija inferior en modo edición */}
      {isEditing && (
        <View style={styles.floatingActionBar}>
          <TouchableOpacity
            style={[
              styles.saveFloatingBtn,
              (isSaving || isTripSaving) && { opacity: 0.6 },
            ]}
            onPress={handleSaveAll}
            disabled={isSaving || isTripSaving}
          >
            <Text style={styles.buttonText}>
              {isSaving || isTripSaving ? "Guardando..." : "Guardar Cambios"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelFloatingBtn}
            onPress={handleCancelAll}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default AdminOrderDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8f3",
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 40,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ede0d4",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#5a3e1b",
  },
  declineReasonText: {
    fontSize: 14,
    color: "#D32F2F",
    fontStyle: "italic",
    marginTop: 8,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  floatingActionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  saveFloatingBtn: {
    flex: 1,
    backgroundColor: "#166534",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelFloatingBtn: {
    flex: 1,
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rejectButton: {
    backgroundColor: "#F44336",
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
