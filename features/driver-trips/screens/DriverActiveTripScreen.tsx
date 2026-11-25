import React, { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { DriverTripMap } from "@/components/driver/DriverTripMap";
import { DriverTripOrderCard } from "@/components/driver/DriverTripOrderCard";
import { TripActionButtons } from "@/components/driver/TripActionButtons";
import { Palette } from "@/constants/theme";
import { useSupportConfig } from "@/hooks/useSupportConfig";
import { useActiveTripExecution } from "../hooks/useActiveTripExecution";
import { TripExecutionModals } from "../components/TripExecutionModals";
import { DeliveryPinModal } from "../components/DeliveryPinModal";

export const DriverActiveTripScreen: React.FC = () => {
  const { supportConfig, refreshSupport } = useSupportConfig();
  const {
    trip,
    location,
    expandedOrderIndex,
    isCancelModalVisible,
    cancelReason,
    setCancelReason,
    isDeliveryModalVisible,
    isPinModalVisible,
    setIsPinModalVisible,
    confirmCompleteWithPin,
    navigateBack,
    handleStartTrip,
    handleOpenDeliveryModal,
    handleSendDelivery,
    confirmCancelTrip,
    handleCompleteOrder,
    handleCallClient,
    handleWhatsapp,
    toggleOrder,
    setIsCancelModalVisible,
    setIsDeliveryModalVisible,
  } = useActiveTripExecution();

  useEffect(() => {
    if (isPinModalVisible) {
      refreshSupport();
    }
  }, [isPinModalVisible, refreshSupport]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Detalle del viaje"
          subtitle={`Viaje #${trip?.tripNumber || "N/A"}`}
          showBack={true}
          onBack={navigateBack}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Órdenes del viaje</Text>
          {!trip?.orders || trip.orders.length === 0 ? (
            <View style={{ paddingVertical: 12, alignItems: "center" }}>
              <ActivityIndicator size="small" color={Palette.primary} />
              <Text style={{ color: "#64748B", fontSize: 13, marginTop: 6 }}>
                Cargando órdenes del viaje...
              </Text>
            </View>
          ) : (
            trip.orders.map((order: any, index: number) => (
              <DriverTripOrderCard
                key={order?.id || index}
                order={order}
                isExpanded={expandedOrderIndex === index}
                onToggle={() => toggleOrder(index)}
                onCall={handleCallClient}
                onWhatsapp={handleWhatsapp}
                tripStatus={trip?.status}
                onOpenDeliveryModal={handleOpenDeliveryModal}
              />
            ))
          )}

          {trip?.comments ? (
            <View style={styles.commentsCard}>
              <View style={styles.commentsHeader}>
                <Ionicons name="chatbox-ellipses-outline" size={16} color="#0284C7" />
                <Text style={styles.commentsLabel}>Instrucciones / Comentarios</Text>
              </View>
              <Text style={styles.commentsValue}>{trip.comments}</Text>
            </View>
          ) : null}
        </View>

        <TripActionButtons
          tripStatus={trip?.status || ""}
          onStartTrip={handleStartTrip}
          onCompleteOrder={handleCompleteOrder}
          onCancel={() => setIsCancelModalVisible(true)}
        />

        <DriverTripMap
          location={location}
          orders={trip?.orders}
          tripStatus={trip?.status || ""}
        />

        <TripExecutionModals
          isCancelModalVisible={isCancelModalVisible}
          isDeliveryModalVisible={isDeliveryModalVisible}
          cancelReason={cancelReason}
          onCancelReasonChange={setCancelReason}
          onConfirmCancel={confirmCancelTrip}
          onCloseCancel={() => {
            setIsCancelModalVisible(false);
            setCancelReason("");
          }}
          onConfirmDelivery={handleSendDelivery}
          onCloseDelivery={() => setIsDeliveryModalVisible(false)}
        />

        <DeliveryPinModal
          visible={isPinModalVisible}
          tripNumber={trip?.tripNumber}
          supportWhatsapp={supportConfig.whatsapp}
          supportPhone={supportConfig.phone}
          onConfirm={confirmCompleteWithPin}
          onClose={() => setIsPinModalVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 16,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: Palette.primaryDark,
  },
  commentsCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  commentsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  commentsValue: {
    fontSize: 13,
    color: "#1E293B",
    lineHeight: 18,
    fontWeight: "500",
  },
});
