import { useLoading } from "@/context/loadingContext";
import { AcceptedTripContext } from "@/context/TripContext";
import { getAllTrips, getTripDetail } from "@/services/tripsService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import { useAlert } from "@/context/alertContext";
import {
  Alert,
  ScrollView,
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

const TripsScreen: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");

  const { show, hide } = useLoading();
  const router = useRouter();
  const { saveTrip } = useContext(AcceptedTripContext);
  const { showAlert } = useAlert();

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

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

  const statusTranslation: Record<string, StatusInfo> = {
    available: { text: "Pendiente", color: "#FFA500" },
    accepted: { text: "Aceptado", color: "#0047AB" },
    canceled: { text: "Cancelado", color: "#F44336" },
    started: { text: "Iniciado", color: "#2196F3" },
    completed: { text: "Finalizado", color: "#4CAF50" },
    default: { text: "Desconocido", color: "#9E9E9E" },
  };

  const filteredTrips = trips.filter((trip) => {
    const statusInfo =
      statusTranslation[trip.status ?? ""] || statusTranslation.default;

    const matchesSearch =
      trip.tripNumber?.toLowerCase().includes(search.toLowerCase()) ||
      trip.comments?.toLowerCase().includes(search.toLowerCase()) ||
      trip.orderIds.some((id) =>
        id.toLowerCase().includes(search.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "Todos" || statusInfo.text === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewTrip = async (tripId: string) => {
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
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Gestión de viajes</Text>
        <TouchableOpacity onPress={() => router.push("/create-trip")}>
          <Ionicons name="add-circle" size={32} color="#E31E24" />
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Buscar viaje..."
        placeholderTextColor="#999"
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filterContainer}>
        {[
          "Todos",
          "Pendiente",
          "Aceptado",
          "Rechazado",
          "Iniciado",
          "Finalizado",
        ].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              statusFilter === status && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === status && { color: "#fff" },
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredTrips?.map((trip) => {
        const statusInfo =
          statusTranslation[trip.status ?? ""] || statusTranslation.default;

        return (
          <TouchableOpacity
            key={trip.id}
            style={styles.tripCard}
            onPress={() => handleViewTrip(trip.id)}
          >
            <View style={styles.tripHeader}>
              <Text style={styles.tripNumber}>{trip.tripNumber}</Text>
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
      })}
    </ScrollView>
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
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: "#E31E24",
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: "#E31E24",
  },
  filterButtonText: {
    color: "#E31E24",
    fontWeight: "600",
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
});
