import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { getDriverTripsHistory } from "@/services/tripsService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Trip } from "@/types/trips";

type StatusInfo = {
  text: string;
  color: string;
};

export const statusMap: Record<string, StatusInfo> = {
  completed: { text: "Finalizado", color: "#4CAF50" },
  accepted: { text: "Aceptado", color: "#0047AB" },
  assigned: { text: "Asignado", color: "#D97706" },
  canceled: { text: "Cancelado", color: "#F44336" },
  started: { text: "En curso", color: "#2196F3" },
  in_progress: { text: "En curso", color: "#2196F3" },
  available: { text: "Disponible", color: "#A020F0" },
  default: { text: "Desconocido", color: "#9E9E9E" },
};

const DriverTripsScreen: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState("");
  const { show, hide } = useLoading();
  const router = useRouter();
  const { showAlert } = useAlert();

  const fetchTrips = async () => {
    try {
      show();
      const data = await getDriverTripsHistory();
      hide();
      if (data.success) {
        setTrips(data.trips);
      } else {
        showAlert({
          message: "No se pudieron cargar los viajes.",
          type: "error",
        });
      }
    } catch (err) {
      hide();
      console.error(err);
      showAlert({
        message: "Hubo un problema al obtener los viajes.",
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

  const handleOpenTrip = (tripId: string) => {
    router.push({
      pathname: "/(protected)/(tabs)/(orders)/(driver)/driver-trip-detail",
      params: { tripId },
    });
  };

  const filteredTrips = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    if (!searchLower) return trips;

    return trips.filter((trip) => {
      const matchesTripNumber = trip.tripNumber
        ?.toLowerCase()
        .includes(searchLower);
      const matchesComments = trip.comments?.toLowerCase().includes(searchLower);
      const matchesStatus = (statusMap[trip.status || "default"]?.text || "Desconocido")
        .toLowerCase()
        .includes(searchLower);
      const matchesOrderIds = trip.orderIds?.some((id) =>
        id.toLowerCase().includes(searchLower)
      );
      const matchesCreatedAt = new Date(trip.createdAt)
        .toLocaleString()
        .toLowerCase()
        .includes(searchLower);

      return (
        matchesTripNumber ||
        matchesComments ||
        matchesStatus ||
        matchesOrderIds ||
        matchesCreatedAt
      );
    });
  }, [trips, search]);

  const renderHeader = useCallback(
    () => (
      <>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Histórico de viajes</Text>
          <TouchableOpacity onPress={fetchTrips} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#A04A0E" />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Buscar..."
          placeholderTextColor="#999"
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </>
    ),
    [fetchTrips, search]
  );

  const renderEmpty = useCallback(
    () => (
      <Text style={styles.noTrips}>No se encontraron viajes</Text>
    ),
    []
  );

  const renderTripItem = useCallback(
    ({ item: trip }: { item: Trip }) => {
      const { text: statusText, color: statusColor } =
        statusMap[trip.status || "default"] || statusMap.default;

      return (
        <TouchableOpacity
          key={trip.id}
          style={styles.card}
          onPress={() => handleOpenTrip(trip.id)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{trip.tripNumber}</Text>
            <Text
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              {statusText}
            </Text>
          </View>
          <Text style={styles.cardDetail}>Toneladas: {trip.totalTons}</Text>
          <Text style={styles.cardDetail}>
            Fecha: {new Date(trip.createdAt).toLocaleDateString()}{" "}
            {new Date(trip.createdAt).toLocaleTimeString()}
          </Text>
        </TouchableOpacity>
      );
    },
    []
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
      data={filteredTrips}
      keyExtractor={(item) => item.id}
      renderItem={renderTripItem}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      initialNumToRender={8}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
};

export default DriverTripsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8f3",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
    marginBottom: 20,
    fontSize: 15,
  },
  noTrips: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#A04A0E",
  },
  cardStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardDetail: {
    fontSize: 15,
    color: "#555",
    marginBottom: 4,
  },
  statusBadge: {
    color: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontWeight: "600",
    overflow: "hidden",
    alignSelf: "flex-start",
    fontSize: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1c9b0",
    backgroundColor: "#fff",
    shadowColor: "#A04A0E",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
});
