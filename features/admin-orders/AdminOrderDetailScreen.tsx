import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminOrderDetail } from "./hooks/useAdminOrderDetail";
import { useDeliveryEditor } from "./hooks/useDeliveryEditor";
import { AdminOrderHeader } from "./components/AdminOrderHeader";
import { OrderFinancialSummary } from "./components/OrderFinancialSummary";
import { OrderDispatchCard } from "./components/OrderDispatchCard";
import { DeliveriesSection } from "./components/DeliveriesSection";
import { DriverAssignmentCard } from "./components/DriverAssignmentCard";
import { RejectOrderModal } from "./components/RejectOrderModal";
import { ReceiptViewerModal } from "./components/ReceiptViewerModal";
import { AddDeliveryAddressModal } from "./components/AddDeliveryAddressModal";

export interface AdminOrderDetailScreenProps {
  orderId?: string;
}

export const AdminOrderDetailScreen: React.FC<AdminOrderDetailScreenProps> = ({
  orderId,
}) => {
  const {
    currentOrder,
    trip,
    users,
    drivers,
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
    setFreshOrder,
    updateOrder,
  } = useAdminOrderDetail(orderId);

  const {
    isEditing,
    isSaving,
    editedDeliveryType,
    setEditedDeliveryType,
    editedDeliveries,
    handleEdit,
    handleSave,
    handleCancel,
    addDelivery,
    updateDelivery,
    removeDelivery,
    handleUserSelection,
    isAddingNewAddress,
    setIsAddingNewAddress,
    newAddressData,
    setNewAddressData,
    handleAddNewAddress,
    productOptions,
    documentTypeOptions,
  } = useDeliveryEditor(currentOrder, users, updateOrder, setFreshOrder);

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
      >
        {/* 1. Cabecera y datos de contacto del cliente */}
        <AdminOrderHeader
          order={currentOrder}
          isEditing={isEditing}
          isSaving={isSaving}
          editedDeliveryType={editedDeliveryType}
          setEditedDeliveryType={setEditedDeliveryType}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
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
          onAddDelivery={addDelivery}
          onUpdateDelivery={updateDelivery}
          onRemoveDelivery={removeDelivery}
          onUserSelection={handleUserSelection}
          onOpenNewAddressModal={() => setIsAddingNewAddress(true)}
        />

        {/* 6. Estado de la Orden */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de la orden</Text>
          <StatusBadge status={currentOrder.status} />
          {Boolean(currentOrder.declineReason) && (
            <Text style={styles.declineReasonText}>
              Motivo de rechazo: {currentOrder.declineReason}
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

        {/* 8. Asignación de Conductor Específico */}
        {isPendingOrRequested && !isEditing && isDelivery && (
          <DriverAssignmentCard
            drivers={drivers}
            selectedDriverId={selectedDriverId}
            onSelectDriver={setSelectedDriverId}
          />
        )}

        {/* 9. Botones de Aprobación / Rechazo */}
        {!isEditing && isPendingOrRequested && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={approveOrder}
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
              additionalInfo: "",
            });
          }}
        />
      </ScrollView>
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
