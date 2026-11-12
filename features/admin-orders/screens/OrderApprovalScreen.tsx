import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOrderApprovalPlanner } from "../hooks/useOrderApprovalPlanner";
import { OrderApprovalVerificationCard } from "../components/approval/OrderApprovalVerificationCard";
import { DeliveryApprovalCard } from "../components/approval/DeliveryApprovalCard";
import { OrderApprovalFooter } from "../components/approval/OrderApprovalFooter";
import { DriverSelectionModal } from "../components/DriverSelectionModal";
import { ReceiptViewerModal } from "../components/ReceiptViewerModal";

interface Props {
  orderId: string;
}

export const OrderApprovalScreen: React.FC<Props> = ({ orderId }) => {
  const router = useRouter();
  const {
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
  } = useOrderApprovalPlanner(orderId);

  if (loading || !order) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0F294A" />
        <Text style={styles.loadingText}>Cargando planificación de orden...</Text>
      </View>
    );
  }

  const isPickup = order.deliveryType === "almacen";
  const totalOrderTons = Number(order.totalTons || order.pendingBalance) || 0;
  const totalPlannedTons = deliveriesPlan.reduce(
    (acc, del) => acc + del.trucks.reduce((sum, t) => sum + (Number(t.totalTons) || 0), 0),
    0
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F294A" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Aprobación y Despacho Logístico</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <OrderApprovalVerificationCard
          order={order}
          onViewReceipt={() => setReceiptModalVisible(true)}
        />

        {!isPickup && (
          <>
            <Text style={styles.sectionTitle}>Planificación de Entregas y Camiones</Text>
            <Text style={styles.sectionSubtitle}>
              Verifica y fracciona la carga de cada destino en viajes de camiones para los conductores:
            </Text>

            {deliveriesPlan.map((del, idx) => (
              <DeliveryApprovalCard
                key={del.id || `plan-del-${idx}`}
                delivery={del}
                onAddTruck={() => handleAddTruck(idx)}
                onUpdateTruckTons={(truckId, tons) => handleUpdateTruckTons(idx, truckId, tons)}
                onOpenDriverModal={(truckId) => {
                  const trk = del.trucks.find((t) => t.id === truckId);
                  if (trk) handleOpenDriverModal(idx, trk);
                }}
                onRemoveTruck={(truckId) => handleRemoveTruck(idx, truckId)}
              />
            ))}
          </>
        )}

        <OrderApprovalFooter
          totalOrderTons={totalOrderTons}
          totalPlannedTons={totalPlannedTons}
          onConfirm={handleConfirmApproval}
          isPickup={isPickup}
        />
      </ScrollView>

      {driverModalVisible && activeDriverTarget && (
        <DriverSelectionModal
          visible={driverModalVisible}
          onClose={() => setDriverModalVisible(false)}
          order={order}
          targetTons={activeDriverTarget.tons}
          drivers={drivers}
          allTrips={[]}
          selectedDriverId={activeDriverTarget.currentDriverId || ""}
          onSelectDriver={handleSelectDriver}
        />
      )}

      {receiptModalVisible && (
        <ReceiptViewerModal
          visible={receiptModalVisible}
          imageUrl={order.receiptImage}
          onClose={() => setReceiptModalVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  backBtn: {
    marginRight: 12,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
    marginTop: 8,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 14,
    lineHeight: 18,
  },
});
