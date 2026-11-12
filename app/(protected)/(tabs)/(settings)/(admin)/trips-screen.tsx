import { useLoading } from "@/context/loadingContext";
import { AcceptedTripContext } from "@/context/TripContext";
import { getAllTrips, getTripDetail } from "@/services/tripsService";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { useAlert } from "@/context/alertContext";
import { FilterChips, FilterOption } from "@/components/FilterChips";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Trip = {
  id: string;
  tripNumber: string;
  orderIds: string[];
  comments: string;
  totalTons: number;
  status: string | null;
  createdAt: string;
};

type StatusInfo = {
  text: string;
  color: string;
};

const isTripFractional = (tripNumber?: string): boolean => {
  if (!tripNumber) return false;
  return /-\d+$/.test(tripNumber.trim());
};

const TRIP_FILTER_OPTIONS: FilterOption<string>[] = [
  { id: "Todos", label: "Todos" },
  { id: "available", label: "Pendientes" },
  { id: "accepted", label: "Aceptados" },
  { id: "completed", label: "Finalizados" },
  { id: "fractional", label: "🧩 Fraccionados" },
  { id: "canceled", label: "Cancelados" },
];

const TripsScreen: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");

  const { show, hide } = useLoading();
  const router = useRouter();
  const { saveTrip } = useContext(AcceptedTripContext);
  const { showAlert } = useAlert();

  const fetchTrips = async () => {
    show();
    const data = await getAllTrips();
    hide();
    if (data.success) {
      setTrips(data.trips);
      console.log(data);
    } else {
      showAlert({
        message: "No se pudieron cargar las órdenes.",
        type: "error",
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const statusTranslation: Record<string, StatusInfo> = {
    available: { text: "Pendiente", color: "#FFA500" },
    assigned: { text: "Asignado", color: "#D97706" },
    accepted: { text: "Aceptado", color: "#0047AB" },
    canceled: { text: "Cancelado", color: "#F44336" },
    started: { text: "Iniciado", color: "#2196F3" },
    in_progress: { text: "En curso", color: "#2196F3" },
    completed: { text: "Finalizado", color: "#4CAF50" },
    default: { text: "Desconocido", color: "#9E9E9E" },
  };

  const tripCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todos: trips.length,
      available: 0,
      accepted: 0,
      completed: 0,
      fractional: 0,
      canceled: 0,
    };
    trips.forEach((t) => {
      let status = t.status || "default";
      if (status === "started" || status === "in_progress") {
        status = "accepted";
      }
      if (status === "assigned") {
        status = "available";
      }
      if (counts[status] !== undefined) {
        counts[status] = (counts[status] || 0) + 1;
      }
      if (isTripFractional(t.tripNumber)) {
        counts.fractional = (counts.fractional || 0) + 1;
      }
    });
    return counts;
  }, [trips]);

  const filteredTrips = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    return trips.filter((trip) => {
      const matchesSearch =
        !searchLower ||
        trip.tripNumber?.toLowerCase().includes(searchLower) ||
        trip.comments?.toLowerCase().includes(searchLower) ||
        trip.orderIds.some((id) =>
          id.toLowerCase().includes(searchLower)
        );

      const matchesStatus =
        statusFilter === "Todos" ||
        (statusFilter === "fractional" && isTripFractional(trip.tripNumber)) ||
        trip.status === statusFilter ||
        (statusFilter === "available" && trip.status === "assigned") ||
        (statusFilter === "accepted" &&
          (trip.status === "started" || trip.status === "in_progress"));

      return matchesSearch && matchesStatus;
    });
  }, [trips, search, statusFilter]);

  const handleViewTrip = useCallback(async (tripId: string) => {
    try {
      show();
      const response = await getTripDetail(tripId);

      if (response.success && response.trip) {
        saveTrip(response.trip);
        router.push("/trip-detail-screen");
      } else {
        showAlert({
          message: "No se pudo cargar el detalle del viaje.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching trip detail:", error);
      showAlert({
        message: "Ocurrió un error al consultar el detalle.",
        type: "error",
      });
    } finally {
      hide();
    }
  }, [show, hide, saveTrip, router, showAlert]);

  const renderHeader = useCallback(
    () => (
      <>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Gestión de viajes</Text>
        </View>

        <TextInput
          placeholder="Buscar viaje..."
          placeholderTextColor="#999"
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />

        <FilterChips
          options={TRIP_FILTER_OPTIONS}
          activeFilter={statusFilter}
          onSelectFilter={setStatusFilter}
          counts={tripCounts}
          style={{ marginBottom: 16 }}
        />
      </>
    ),
    [search, statusFilter, tripCounts]
  );

  const renderTripItem = useCallback(
    ({ item: trip }: { item: Trip }) => {
      const statusInfo =
        statusTranslation[trip.status ?? ""] || statusTranslation.default;

      return (
        <TouchableOpacity
          key={trip.id}
          style={styles.tripCard}
          onPress={() => handleViewTrip(trip.id)}
        >
          <View style={styles.tripHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tripNumber}>{trip.tripNumber}</Text>
              {isTripFractional(trip.tripNumber) && (
                <View style={styles.fractionalTag}>
                  <Text style={styles.fractionalTagText}>🧩 Despacho Fraccionado</Text>
                </View>
              )}
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.color },
              ]}
            >
              <Text style={styles.statusBadgeText}>{statusInfo.text}</Text>
            </View>
          </View>
          <Text style={styles.tripInfo}>
            Toneladas: <Text style={styles.bold}>{trip.totalTons}</Text>
          </Text>
          <Text style={styles.tripInfo}>
            Fecha:{" "}
            <Text style={styles.bold}>
              {new Date(trip.createdAt).toLocaleString()}
            </Text>
          </Text>
          {trip.comments ? (
            <Text style={styles.tripComment}>{trip.comments}</Text>
          ) : null}
        </TouchableOpacity>
      );
    },
    [handleViewTrip]
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
      data={filteredTrips}
      keyExtractor={(item) => item.id}
      renderItem={renderTripItem}
      ListHeaderComponent={renderHeader}
      initialNumToRender={8}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
};

export default TripsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F294A",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#FAFAFA",
  },
  tripCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tripNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  statusBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  tripInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  bold: {
    fontWeight: "600",
  },
  tripComment: {
    marginTop: 8,
    color: "#555",
    fontStyle: "italic",
  },
  fractionalTag: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  fractionalTagText: {
    fontSize: 11,
    color: "#1D4ED8",
    fontWeight: "600",
  },
});
