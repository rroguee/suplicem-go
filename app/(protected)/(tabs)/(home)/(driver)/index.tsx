import CheckRender from "@/components/CheckRender";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { AcceptedTripContext } from "@/context/TripContext";
import {
  aceptedTrip,
  getDriverActualTrips,
  getTripAvailable,
  getTripDetail,
} from "@/services/tripsService";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Trip = {
  id: string;
  tripNumber: string;
  totalTons: number;
  createdAt: string;
};

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
  const router = useRouter();
  const { show, hide } = useLoading();
  const { saveTrip } = useContext(AcceptedTripContext);
  const [actualTripInProgress, setActualTripInProgress] = useState(false);
  const { showAlert } = useAlert();

  useFocusEffect(
    useCallback(() => {
      const getTripsAsync = async () => {
        show();
        fetchTrips();
        await validateTrips();
        hide();
      };

      getTripsAsync();

      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const validateTrips = async () => {
    try {
      setActualTripInProgress(false);
      const actualTripResponse = await getDriverActualTrips();

      if (actualTripResponse?.data?.trips?.length > 0) {
        setActualTripInProgress(true);

        const actualTrip = actualTripResponse?.data?.trips[0];

        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            showAlert({
              message: "Debe activar la ubicación",
              type: "warning",
            });
            return;
          }
        } catch (error) {
          console.error(error);
          showAlert({
            message: "No se pudo solicitar los permisos de ubicación.",
            type: "error",
          });
          return;
        }

        const tripDetailResponse = await getTripDetail(actualTrip?.id);

        if (tripDetailResponse?.success && tripDetailResponse?.trip) {
          saveTrip(tripDetailResponse.trip);
          setTimeout(() => {
            router.push("/driver-order");
          }, 100);
        }

        return;
      }
    } catch (error) {
      console.error(error);
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
        }));

        setTrips(mappedTrips);
      }
    } catch (error) {
      console.error("❌ Error fetching trips:", error);
    }
  };

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleAcceptTrip = async (tripId: string) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showAlert({ message: "Debe activar la ubicación", type: "warning" });
        return;
      }
      show();

      const acceptResponse = await aceptedTrip(tripId);

      if (acceptResponse.success) {
        setActualTripInProgress(true);
        const tripResponse = await getTripDetail(tripId);

        if (tripResponse.success && tripResponse.trip) {
          saveTrip(tripResponse.trip);
          showAlert({ message: "Conduce con cuidado.", type: "success" });
          router.push("/driver-order");
        } else {
          showAlert({
            message: "No se pudo cargar el detalle del viaje.",
            type: "error",
          });
        }
      } else {
        showAlert({
          message: acceptResponse?.message || "No se pudo aceptar el viaje.",
          type: "error",
        });

        fetchTrips();
      }
    } catch (error) {
      console.error("❌ Error accepting trip:", error);
      showAlert({
        message: "Ocurrió un error al aceptar el viaje.",
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
      <View style={styles.topLogoContainer}>
        <Image
          source={require("@/assets/images/logo2.png")}
          style={styles.topLogo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.title}>Viajes disponibles</Text>
        <TouchableOpacity onPress={fetchTrips} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#E31E24" />
        </TouchableOpacity>
      </View>

      {trips.length > 0 ? (
        trips.map((trip, index) => (
          <View key={trip.id} style={styles.card}>
            <Text style={styles.label}>Viaje: {trip.tripNumber}</Text>

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

            <CheckRender allowed={index === 0 && !actualTripInProgress}>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={() => handleAcceptTrip(trip.id)}
              >
                <Text style={styles.buttonText}>Aceptar viaje</Text>
              </TouchableOpacity>
            </CheckRender>
          </View>
        ))
      ) : (
        <NoTripsMessage />
      )}
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
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F294A",
    marginBottom: 12,
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
});
