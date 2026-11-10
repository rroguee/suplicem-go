import { AuthContext } from "@/context/authContext";
import { useLoading } from "@/context/loadingContext";
import { useAlert } from "@/context/alertContext";
import { AcceptedTripContext } from "@/context/TripContext";
import {
  aceptedTrip,
  getDriverActiveTrip,
  getDriverActualTrips,
  getTripAvailable,
  getTripDetail,
  updateTripStatus,
} from "@/services/tripsService";
import { CancelTripModal } from "@/features/admin-trips/components/CancelTripModal";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Trip } from "@/types/trips";
import { FilterChips, FilterOption } from "@/components/FilterChips";

type DriverTripFilter = "todos" | "assigned" | "general";

const DRIVER_TRIP_FILTERS: FilterOption<DriverTripFilter>[] = [
  { id: "todos", label: "Todos" },
  { id: "assigned", label: "Asignados a ti" },
  { id: "general", label: "Generales" },
];

// Componente para el mensaje de no hay viajes (NUEVO)
const NoTripsMessage = () => (
  <View style={noTripsStyles.container}>
    <Ionicons name="car-outline" size={80} color="#E31E24" />
    <Text style={noTripsStyles.title}>¡Todo despejado!</Text>
    <Text style={noTripsStyles.message}>
      No hay viajes disponibles en este momento. Vuelve a intentarlo más tarde o
      espera nuevas asignaciones.
    </Text>
  </View>
);

const DriverHomeScreen = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [actualTrips, setActualTrips] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<DriverTripFilter>("todos");
  const router = useRouter();
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const { user } = useContext(AuthContext);
  const { trip: contextTrip, saveTrip, clearTrip } = useContext(AcceptedTripContext);

  const currentUserId = user?.uid;
  const hasAcceptedTrip = Boolean(
    (activeTrip && activeTrip.status !== "assigned") ||
    (contextTrip && contextTrip.status !== "assigned")
  );

  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [tripToReject, setTripToReject] = useState<any>(null);
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const handleOpenRejectModal = (trip: any) => {
    setTripToReject(trip);
    setRejectReason("");
    setIsRejectModalVisible(true);
  };

  const handleConfirmReject = async () => {
    if (!tripToReject?.id) return;
    if (rejectReason.trim().length < 5) {
      showAlert({
        message: "El motivo del rechazo debe tener al menos 5 caracteres.",
        type: "warning",
      });
      return;
    }

    setIsSubmittingReject(true);
    show();
    try {
      const res = await updateTripStatus(tripToReject.id, "canceled", rejectReason.trim());
      if (res?.success) {
        setIsRejectModalVisible(false);
        setTripToReject(null);
        setRejectReason("");
        showAlert({
          message: "Has rechazado el viaje. Se ha notificado al Administrador para su reasignación.",
          type: "success",
        });
        await fetchTrips();
        await validateTrips();
      } else {
        showAlert({
          message: res?.message || "No se pudo rechazar el viaje.",
          type: "error",
        });
      }
    } catch (err: any) {
      showAlert({
        message: err?.message || "Error al rechazar el viaje.",
        type: "error",
      });
    } finally {
      setIsSubmittingReject(false);
      hide();
    }
  };

  // Contadores dinámicos para los chips de filtro
  const tripCounts = useMemo(() => {
    let assignedCount = 0;
    let generalCount = 0;

    trips.forEach((t) => {
      const isAssignedToMe = Boolean(
        currentUserId && (t.assignedDriverId === currentUserId || (t as any).driverId === currentUserId)
      );
      if (isAssignedToMe) {
        assignedCount++;
      } else {
        generalCount++;
      }
    });

    return {
      todos: trips.length,
      assigned: assignedCount,
      general: generalCount,
    };
  }, [trips, currentUserId]);

  // Lista procesada: filtrada por chip y con viajes asignados estrictamente DE PRIMERO
  const displayedTrips = useMemo(() => {
    const filtered = trips.filter((trip) => {
      const isAssignedToMe = Boolean(
        currentUserId && (trip.assignedDriverId === currentUserId || (trip as any).driverId === currentUserId)
      );
      if (selectedFilter === "assigned") return isAssignedToMe;
      if (selectedFilter === "general") return !isAssignedToMe;
      return true;
    });

    return [...filtered].sort((a, b) => {
      const aIsMine = Boolean(
        currentUserId && (a.assignedDriverId === currentUserId || (a as any).driverId === currentUserId)
      );
      const bIsMine = Boolean(
        currentUserId && (b.assignedDriverId === currentUserId || (b as any).driverId === currentUserId)
      );

      // Prioridad 1: Los asignados al conductor van arriba
      if (aIsMine && !bIsMine) return -1;
      if (!aIsMine && bIsMine) return 1;

      // Prioridad 2: Fecha más antigua primero (FIFO: mayor tiempo esperando)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
  }, [trips, selectedFilter, currentUserId]);

  const validateTrips = async () => {
    try {
      const actualRes = await getDriverActualTrips();
      const myActuals = actualRes?.data?.trips || [];
      setActualTrips(Array.isArray(myActuals) ? myActuals : []);

      const response = await getDriverActiveTrip();

      if (response?.success && response?.data?.hasActiveTrip && response?.data?.trip) {
        const trip = response.data.trip;
        const isMyTrip =
          !user?.uid ||
          trip.assignedDriverId === user?.uid ||
          trip.driverId === user?.uid ||
          trip.driver?.id === user?.uid;

        if (isMyTrip) {
          setActiveTrip(trip);
          saveTrip(trip);
          return;
        }
      }

      setActiveTrip(null);
      clearTrip();
    } catch (error) {
      console.error("Error validando viaje activo:", error);
      setActiveTrip(null);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await getTripAvailable();
      if (response.success && response.trips) {
        const mappedTrips: Trip[] = response.trips.map((trip: any) => ({
          id: trip.id,
          tripNumber: trip.tripNumber,
          totalTons: trip.totalTons,
          createdAt: trip.createdAt,
          assignedDriverId: trip.assignedDriverId,
          comments: trip.comments,
          status: trip.status,
        }));

        setTrips(mappedTrips);
      }
    } catch (error) {
      console.error("❌ Error fetching trips:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const getTripsAsync = async () => {
        show();
        await fetchTrips();
        await validateTrips();
        hide();
      };

      getTripsAsync();

      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={styles.topLogoContainer}>
        <Image
          source={require("@/assets/images/logo2.png")}
          style={styles.topLogo}
          resizeMode="contain"
        />
      </View>

      {/* Banner de Viaje Activo / Aceptado / Asignado */}
      {(actualTrips.length > 0 ? actualTrips : activeTrip ? [activeTrip] : []).map((currTrip) => (
        <View key={currTrip.id} style={styles.activeTripCard}>
          <View style={styles.activeTripHeaderRow}>
            <View
              style={[
                styles.activeTripIconCircle,
                currTrip.status === "accepted" && { backgroundColor: "#2563EB" },
                currTrip.status === "assigned" && { backgroundColor: "#D97706" },
              ]}
            >
              <Ionicons
                name={
                  currTrip.status === "accepted"
                    ? "checkmark-circle"
                    : currTrip.status === "assigned"
                    ? "person-add"
                    : "navigate"
                }
                size={20}
                color="#fff"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.activeTripTitle}>
                {currTrip.status === "accepted"
                  ? `Viaje aceptado: #${currTrip.tripNumber}`
                  : currTrip.status === "assigned"
                  ? `Viaje asignado: #${currTrip.tripNumber}`
                  : `Viaje en curso: #${currTrip.tripNumber}`}
              </Text>
              <Text style={styles.activeTripSubtitle}>
                {currTrip.status === "accepted"
                  ? `Listo para iniciar ruta • ${currTrip.totalTons} Toneladas`
                  : currTrip.status === "assigned"
                  ? `Asignado por administración • ${currTrip.totalTons} Toneladas`
                  : `Ruta en camino • ${currTrip.totalTons} Toneladas`}
              </Text>
            </View>
            <View
              style={[
                styles.activeTripStatusBadge,
                currTrip.status === "accepted" && { backgroundColor: "#DBEAFE" },
                currTrip.status === "assigned" && { backgroundColor: "#FEF3C7" },
              ]}
            >
              <Text
                style={[
                  styles.activeTripStatusText,
                  currTrip.status === "accepted" && { color: "#1D4ED8" },
                  currTrip.status === "assigned" && { color: "#B45309" },
                ]}
              >
                {currTrip.status === "accepted"
                  ? "Aceptado"
                  : currTrip.status === "assigned"
                  ? "Asignado"
                  : "En curso"}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <TouchableOpacity
              style={[
                styles.continueTripButton,
                { flex: 1.5, backgroundColor: "#2563EB", marginTop: 0 },
              ]}
              activeOpacity={0.85}
              onPress={() => {
                saveTrip({ ...currTrip, status: "accepted" } as any);
                router.push("/driver-order");
              }}
            >
              <Text style={styles.continueTripButtonText}>
                {currTrip.status === "started" || currTrip.status === "in_progress"
                  ? "Ver viaje en curso"
                  : "Ir a iniciar ruta"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>

            {currTrip.status !== "started" && currTrip.status !== "in_progress" && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#FEF2F2",
                  borderWidth: 1,
                  borderColor: "#EF4444",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  gap: 4,
                }}
                activeOpacity={0.85}
                onPress={() => handleOpenRejectModal(currTrip)}
              >
                <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                <Text style={{ color: "#DC2626", fontWeight: "bold", fontSize: 13 }}>
                  Rechazar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

        <View style={styles.headerRow}>
        <Text style={styles.title}>Viajes disponibles</Text>
        <TouchableOpacity onPress={fetchTrips} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#E31E24" />
        </TouchableOpacity>
      </View>

      {/* Filtro por Chips */}
      <FilterChips<DriverTripFilter>
        options={DRIVER_TRIP_FILTERS}
        activeFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        counts={tripCounts}
        style={styles.filterChipsContainer}
      />

      {displayedTrips.length > 0 ? (
        displayedTrips.map((trip, index) => (
          <View key={trip.id} style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.label}>Viaje: {trip.tripNumber}</Text>
              <View style={[styles.assignedBadge, { backgroundColor: "#DBEAFE", borderColor: "#2563EB" }]}>
                <Text style={[styles.assignedBadgeText, { color: "#1D4ED8" }]}>✓ Aceptado</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={18} color="#E31E24" />
              <Text style={styles.detail}>Toneladas: {trip.totalTons}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#E31E24" />
              <Text style={styles.detail}>
                Fecha: {formatDate(trip.createdAt)}
              </Text>
            </View>

            {trip.comments ? (
              <View style={styles.infoRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#666" />
                <Text style={[styles.detail, { color: "#666" }]}>
                  {trip.comments}
                </Text>
              </View>
            ) : null}

            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                style={[styles.acceptCardButton, { backgroundColor: "#2563EB" }]}
                activeOpacity={0.8}
                onPress={() => {
                  saveTrip({ ...trip, status: "accepted" } as any);
                  router.push("/driver-order");
                }}
              >
                <Ionicons
                  name="navigate-outline"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.buttonText}>
                  Iniciar Ruta
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rejectCardButton}
                activeOpacity={0.8}
                onPress={() => handleOpenRejectModal(trip)}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color="#DC2626"
                />
                <Text style={styles.rejectButtonText}>
                  Rechazar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.detailCardButton}
                activeOpacity={0.8}
                onPress={() => {
                  router.push({
                    pathname: "/driver-trip-preview",
                    params: { tripId: trip.id },
                  });
                }}
              >
                <Ionicons
                  name="eye-outline"
                  size={18}
                  color="#0F294A"
                />
                <Text style={styles.detailButtonText}>
                  Detalle
                </Text>
              </TouchableOpacity>
            </View>
            {hasAcceptedTrip && (
              <Text style={styles.disabledTripNotice}>
                Ya tienes un viaje aceptado o en curso
              </Text>
            )}
          </View>
        ))
      ) : trips.length > 0 ? (
        <View style={noTripsStyles.container}>
          <Ionicons name="filter-outline" size={60} color="#94A3B8" />
          <Text style={noTripsStyles.title}>Sin viajes en este filtro</Text>
          <Text style={noTripsStyles.message}>
            {selectedFilter === "assigned"
              ? "No tienes viajes asignados directamente en este momento."
              : "No hay viajes disponibles en esta categoría."}
          </Text>
        </View>
      ) : (
        <NoTripsMessage />
      )}

      {/* Modal para motivo obligatorio de rechazo */}
      <CancelTripModal
        visible={isRejectModalVisible}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onConfirm={handleConfirmReject}
        onCancel={() => {
          setIsRejectModalVisible(false);
          setTripToReject(null);
          setRejectReason("");
        }}
        isSubmitting={isSubmittingReject}
      />
    </ScrollView>
  );
};

export default DriverHomeScreen;

const noTripsStyles = StyleSheet.create({
  container: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F294A",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  topLogoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  topLogo: {
    width: 180,
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F294A",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F294A",
  },
  assignedBadge: {
    backgroundColor: "#E0E7FF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#4338CA",
  },
  assignedBadgeText: {
    color: "#4338CA",
    fontWeight: "bold",
    fontSize: 12,
  },
  generalBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#16A34A",
  },
  generalBadgeText: {
    color: "#16A34A",
    fontWeight: "bold",
    fontSize: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detail: {
    fontSize: 15,
    color: "#555",
    marginLeft: 8,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#E31E24",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    elevation: 2,
  },
  noTripsText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#777",
  },
  activeTripCard: {
    backgroundColor: "#0F294A",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#0F294A",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  activeTripHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  activeTripIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E31E24",
    alignItems: "center",
    justifyContent: "center",
  },
  activeTripTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  activeTripSubtitle: {
    color: "#CBD5E1",
    fontSize: 13,
    marginTop: 2,
  },
  activeTripStatusBadge: {
    backgroundColor: "rgba(227, 30, 36, 0.2)",
    borderColor: "#E31E24",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeTripStatusText: {
    color: "#FFA4A7",
    fontSize: 11,
    fontWeight: "bold",
  },
  continueTripButton: {
    backgroundColor: "#E31E24",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  continueTripButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: "#E2E8F0",
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonText: {
    color: "#94A3B8",
  },
  disabledTripNotice: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  acceptCardButton: {
    flex: 1.2,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  rejectCardButton: {
    flex: 1,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    borderRadius: 10,
  },
  rejectButtonText: {
    color: "#DC2626",
    fontWeight: "bold",
    fontSize: 14,
  },
  detailCardButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  detailButtonText: {
    color: "#0F294A",
    fontWeight: "bold",
    fontSize: 14,
  },

  filterChipsContainer: {
    marginBottom: 16,
  },
});
