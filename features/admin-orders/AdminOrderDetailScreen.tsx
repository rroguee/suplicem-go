import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBadge } from "@/components/StatusBadge";
import { useAlert } from "@/context/alertContext";
import { useAdminOrderDetail } from "./hooks/useAdminOrderDetail";
import { useDeliveryEditor } from "./hooks/useDeliveryEditor";
import { useAdminOrderStaging } from "./hooks/useAdminOrderStaging";
import { useAdminOrderDetailModals } from "./hooks/useAdminOrderDetailModals";
import { AdminOrderHeader } from "./components/AdminOrderHeader";
import { OrderFinancialSummary } from "./components/OrderFinancialSummary";
import { OrderDispatchCard } from "./components/OrderDispatchCard";
import { DeliveriesSection } from "./components/DeliveriesSection";
import { DriverAssignmentCard } from "./components/DriverAssignmentCard";
import { OrderTripsProgressCard } from "./components/OrderTripsProgressCard";
import { PaymentReceiptCard } from "./components/PaymentReceiptCard";
import { WarehousePickupCard } from "./components/WarehousePickupCard";
import { AdminOrderDetailModals } from "./components/AdminOrderDetailModals";
import { AdminOrderActionButtons } from "./components/AdminOrderActionButtons";
import { styles } from "./styles/adminOrderDetail.styles";

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

  const modals = useAdminOrderDetailModals({
    isEditing,
    approveOrder,
    splitSpecificTrip,
    planAndSplitTrips,
    setPendingSingleTripSplits,
    setPendingAllTripsPlan,
    setPendingDriverAssignments,
  });

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
            onDispatchNextTrip={() => modals.setFractionalModalVisible(true)}
            isDispatching={isDispatching}
            drivers={drivers}
            onAssignDriverToTrip={modals.handleAssignDriverToTrip}
            onCancelAndResplitTrip={modals.handleStartSplitSingleTrip}
            onOpenPlanner={modals.handleOpenPlanner}
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
        <AdminOrderActionButtons
          isEditing={isEditing}
          isPendingOrRequested={isPendingOrRequested}
          isSaving={isSaving || isTripSaving}
          onApprovePress={handleApprovePress}
          onRejectPress={() => setRejectModalVisible(true)}
          onSaveAll={handleSaveAll}
          onCancelAll={handleCancelAll}
        />

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
          fractionalModalVisible={modals.fractionalModalVisible}
          setFractionalModalVisible={modals.setFractionalModalVisible}
          plannerModalVisible={modals.plannerModalVisible}
          setPlannerModalVisible={modals.setPlannerModalVisible}
          tripToSplitDirectly={modals.tripToSplitDirectly}
          setTripToSplitDirectly={modals.setTripToSplitDirectly}
          handleConfirmPlan={modals.handleConfirmPlan}
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
          tripDriverModalVisible={modals.tripDriverModalVisible}
          setTripDriverModalVisible={modals.setTripDriverModalVisible}
          targetTripForDriver={modals.targetTripForDriver}
          setTargetTripForDriver={modals.setTargetTripForDriver}
          onSelectTripDriver={modals.handleSelectTripDriver}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AdminOrderDetailScreen;
