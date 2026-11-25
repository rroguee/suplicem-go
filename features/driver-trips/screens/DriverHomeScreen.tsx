import React from "react";
import { Image, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { CancelTripModal } from "@/features/admin-trips/components/CancelTripModal";
import { useDriverHomeTrips } from "../hooks/useDriverHomeTrips";
import { ActiveTripBanner } from "../components/ActiveTripBanner";
import { NoTripsMessage } from "../components/NoTripsMessage";

export const DriverHomeScreen: React.FC = () => {
  const {
    activeTripsToRender,
    refreshing,
    onRefresh,
    isRejectModalVisible,
    rejectReason,
    setRejectReason,
    isSubmittingReject,
    saveTrip,
    handleOpenRejectModal,
    handleCloseRejectModal,
    handleConfirmReject,
    router,
  } = useDriverHomeTrips();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#E31E24"]}
          tintColor="#E31E24"
        />
      }
    >
      <View style={styles.topLogoContainer}>
        <Image
          source={require("@/assets/images/logo2.png")}
          style={styles.topLogo}
          resizeMode="contain"
        />
      </View>

      {activeTripsToRender.length > 0 ? (
        activeTripsToRender.map((currTrip) => (
          <ActiveTripBanner
            key={currTrip.id}
            currTrip={currTrip}
            onContinue={(trip) => {
              saveTrip({ ...trip, status: "accepted" } as any);
              router.push("/driver-order");
            }}
            onReject={handleOpenRejectModal}
          />
        ))
      ) : (
        <NoTripsMessage />
      )}

      <CancelTripModal
        visible={isRejectModalVisible}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onConfirm={handleConfirmReject}
        onCancel={handleCloseRejectModal}
        isSubmitting={isSubmittingReject}
      />
    </ScrollView>
  );
};

export default DriverHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  topLogoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  topLogo: {
    width: 180,
    height: 60,
  },
});
