import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Trip } from "@/types/trips";
import { DriverSelectionModal } from "./components/DriverSelectionModal";
import { StatusBadge } from "@/components/StatusBadge";
import { useAlert } from "@/context/alertContext";
import { useAdminOrderDetail } from "./hooks/useAdminOrderDetail";
import { useDeliveryEditor } from "./hooks/useDeliveryEditor";
import { AdminOrderHeader } from "./components/AdminOrderHeader";
import { OrderFinancialSummary } from "./components/OrderFinancialSummary";
import { OrderDispatchCard } from "./components/OrderDispatchCard";
import { DeliveriesSection } from "./components/DeliveriesSection";
import { DriverAssignmentCard } from "./components/DriverAssignmentCard";
import { OrderTripsProgressCard } from "./components/OrderTripsProgressCard";
import { DispatchFractionalTripModal } from "./components/DispatchFractionalTripModal";
import { RejectOrderModal } from "./components/RejectOrderModal";
import { ReceiptViewerModal } from "./components/ReceiptViewerModal";
import { AddDeliveryAddressModal } from "./components/AddDeliveryAddressModal";
import {
  OrderTripPlannerModal,
  PlannedTripItem,
} from "./components/OrderTripPlannerModal";


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
    cancelAndResplitTrip,
    planAndSplitTrips,
    splitSpecificTrip,
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

  // Estados provisionales (staging) durante el modo edición
  const [pendingSingleTripSplits, setPendingSingleTripSplits] = useState<
    Array<{ tripId: string; subTrips: PlannedTripItem[] }>
  >([]);
  const [pendingDriverAssignments, setPendingDriverAssignments] = useState<Record<string, string>>({});
  const [pendingAllTripsPlan, setPendingAllTripsPlan] = useState<PlannedTripItem[] | null>(null);
  const [isTripSaving, setIsTripSaving] = useState(false);

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
        // En modo edición: diferir el guardado hasta pulsar [Guardar Cambios]
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
  }, [orderTrips, isEditing, pendingAllTripsPlan, pendingDriverAssignments, pendingSingleTripSplits, currentOrder?.orderNumber, currentOrder?.id]);

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

  const handleConfirmPickup = () => {
    Alert.alert(
      "Confirmar Retiro en Almacén",
      "¿Confirmas que el cliente ha recibido todos los materiales en el almacén?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar Entrega",
          style: "default",
          onPress: () => completePickup(),
        },
      ]
    );
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

        {/* 4. Conductor y vehículo asignado (si existe despacho) */}
        {trip?.driver && <OrderDispatchCard driver={trip.driver} />}

        {/* 5. Entregas / Repartos */}
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

        {/* 6. Estado de la Orden */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de la orden</Text>
          <StatusBadge status={currentOrder.status} />
          
           {Boolean(currentOrder.rejectionReason || currentOrder.declineReason) && (
            <Text style={styles.declineReasonText}>
              Motivo de rechazo: {currentOrder.rejectionReason || currentOrder.declineReason}
            </Text>
          )}
        </View>

        {/* 7. Comprobante de Pago */}
        {currentOrder.receiptImage ? (
          <View style={styles.receiptAdminCard}>
            <View style={styles.receiptAdminHeader}>
              <Ionicons name="card-outline" size={22} color="#A04A0E" />
              <Text style={styles.receiptAdminTitle}>
                Comprobante de Pago Adjunto
              </Text>
            </View>

            <TouchableOpacity
              style={styles.receiptImageTouchContainer}
              onPress={() => setViewReceiptModalVisible(true)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: currentOrder.receiptImage }}
                style={styles.receiptAdminThumbnail}
                resizeMode="cover"
              />
              <View style={styles.receiptTapOverlay}>
                <Ionicons name="scan-outline" size={22} color="#fff" />
                <Text style={styles.receiptTapText}>
                  Toca para ampliar comprobante
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : currentOrder.comments?.includes("Transferencia Bancaria") ? (
          <View style={styles.receiptAdminCardMissing}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#D32F2F"
            />
            <Text style={styles.receiptAdminMissingText}>
              Pago por Transferencia Bancaria: Comprobante digital no disponible.
            </Text>
          </View>
        ) : null}

        {/* 8. Progreso de Viajes y Despachos Simultáneos */}
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


        {/* 9. Asignación de Conductor Específico para Aprobación Inicial */}
        {isPendingOrRequested && !isEditing && isDelivery && (
          <DriverAssignmentCard
            order={currentOrder}
            drivers={drivers}
            allTrips={allTrips}
            selectedDriverId={selectedDriverId}
            onSelectDriver={setSelectedDriverId}
          />
        )}

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
          title={tripToSplitDirectly ? `Fraccionar Viaje ${tripToSplitDirectly.tripNumber}` : undefined}
          isSingleTripSplit={Boolean(tripToSplitDirectly)}
          initialDriverId={tripToSplitDirectly?.assignedDriverId}
        />


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

        {/* 10. Acción para Pedidos de Retiro en Almacén Aprobados */}
        {!isEditing && !isDelivery && currentOrder.status === "approved" && (
          <View style={styles.pickupActionCard}>
            <View style={styles.pickupActionHeader}>
              <Ionicons name="storefront" size={24} color="#166534" />
              <View style={styles.pickupActionTextWrap}>
                <Text style={styles.pickupActionTitle}>Retiro en Almacén Pendiente</Text>
                <Text style={styles.pickupActionSubtitle}>
                  El cliente debe retirar los materiales directamente en el almacén.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.completePickupButton}
              onPress={handleConfirmPickup}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.completePickupButtonText}>Confirmar Retiro en Almacén</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 11. Estado Completado para Retiro en Almacén */}
        {!isDelivery && currentOrder.status === "completed" && (
          <View style={styles.pickupCompletedCard}>
            <Ionicons name="checkmark-done-circle" size={26} color="#166534" />
            <Text style={styles.pickupCompletedText}>
              Materiales entregados en almacén exitosamente.
            </Text>
          </View>
        )}


        {/* Modales desacoplados */}
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

        {/* Modal para asignar conductor a un viaje existente */}
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
          onSelectDriver={(drvId) => {
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
  receiptAdminCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffe0b2",
    padding: 14,
    marginBottom: 16,
  },
  receiptAdminHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  receiptAdminTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#A04A0E",
  },
  receiptImageTouchContainer: {
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
    height: 180,
    backgroundColor: "#000000",
  },
  receiptAdminThumbnail: {
    width: "100%",
    height: "100%",
    opacity: 0.85,
  },
  receiptTapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  receiptTapText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  receiptAdminCardMissing: {
    backgroundColor: "#fffde7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fff59d",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  receiptAdminMissingText: {
    fontSize: 13,
    color: "#5d4037",
    flex: 1,
    lineHeight: 18,
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
  pickupActionCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 16,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pickupActionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  pickupActionTextWrap: {
    marginLeft: 12,
    flex: 1,
  },
  pickupActionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#166534",
  },
  pickupActionSubtitle: {
    fontSize: 13,
    color: "#15803D",
    marginTop: 2,
  },
  completePickupButton: {
    backgroundColor: "#166534",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 8,
  },
  completePickupButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  pickupCompletedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#86EFAC",
    marginVertical: 16,
    gap: 10,
  },
  pickupCompletedText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    flex: 1,
  },
});
