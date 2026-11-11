import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenHeader } from "@/components/ScreenHeader";
import { InfoRow } from "@/components/InfoRow";
import { DriverTripMap } from "@/components/driver/DriverTripMap";
import { DriverTripOrderCard } from "@/components/driver/DriverTripOrderCard";
import { TripActionButtons } from "@/components/driver/TripActionButtons";
import { Palette } from "@/constants/theme";
import { useSupportConfig } from "@/hooks/useSupportConfig";
import { useActiveTripExecution } from "../hooks/useActiveTripExecution";
import { TripExecutionModals } from "../components/TripExecutionModals";
import { DeliveryPinModal } from "../components/DeliveryPinModal";

export const DriverActiveTripScreen: React.FC = () => {
  const { supportConfig } = useSupportConfig();
  const {
    trip,
    location,
    expandedOrderIndex,
    isCancelModalVisible,
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <ScreenHeader
        title="Detalle del viaje"
        subtitle={`Viaje #${trip?.tripNumber || "N/A"}`}
        showBack={true}
        onBack={navigateBack}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ordenes</Text>
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

        <View style={{ marginTop: 10 }}>
          <InfoRow
            icon="chatbox-ellipses-outline"
            label="Comentarios"
            value={trip?.comments || "Ninguno"}
          />
        </View>
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
        onConfirmCancel={confirmCancelTrip}
        onCloseCancel={() => setIsCancelModalVisible(false)}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: Palette.primaryDark,
  },
});
