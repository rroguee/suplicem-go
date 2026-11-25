import React from "react";
import { Image, StyleSheet, View, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "@/components/MapViewWrapper";
import { calculateTripEstimate, WAREHOUSE_LOCATION } from "@/utils/tripEstimate";
import { useTripRoute } from "@/hooks/useTripRoute";
import { TripEstimateBanner } from "@/components/trips/TripEstimateBanner";

type DriverTripMapProps = {
  location?: { latitude: number; longitude: number } | null;
  orders?: any[];
  tripStatus?: string;
};

export const DriverTripMap: React.FC<DriverTripMapProps> = ({
  location = null,
  orders = [],
  tripStatus,
}) => {

  // Validador estricto de coordenadas válidas (evita 0, NaN o valores fuera de rango)
  const isValidCoord = (lat: any, lng: any): boolean => {
    if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
    const nLat = Number(lat);
    const nLng = Number(lng);
    return (
      !isNaN(nLat) &&
      !isNaN(nLng) &&
      nLat !== 0 &&
      nLng !== 0 &&
      nLat >= -90 &&
      nLat <= 90 &&
      nLng >= -180 &&
      nLng <= 180
    );
  };

  // Buscar primer destino con coordenadas válidas para centrado inicial
  const firstDestination = orders
    ?.flatMap((order: any) => order?.deliveries || [])
    ?.find((d: any) => isValidCoord(d?.address?.latitude, d?.address?.longitude));

  const hasValidDriverLocation = Boolean(
    location && isValidCoord(location.latitude, location.longitude)
  );

  const originCoords = hasValidDriverLocation && location ? location : WAREHOUSE_LOCATION;

  const destCoords = firstDestination?.address
    ? {
        latitude: Number(firstDestination.address.latitude),
        longitude: Number(firstDestination.address.longitude),
      }
    : null;

  const estimate = destCoords
    ? calculateTripEstimate(originCoords, destCoords)
    : null;

  const { routeCoordinates, roadEstimate } = useTripRoute({ originCoords, destCoords });

  const initialLatitude = originCoords.latitude;
  const initialLongitude = originCoords.longitude;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ruta y Tiempo Estimado de Viaje</Text>

      {/* Banner de estimación de tiempo y ruta reutilizable */}
      {estimate && (
        <TripEstimateBanner
          title="Tiempo estimado de trayecto"
          durationText={
            roadEstimate
              ? `${roadEstimate.formattedDuration} (${roadEstimate.formattedDistance})`
              : estimate.formattedText
          }
          originText={hasValidDriverLocation ? "Ubicación del camión" : WAREHOUSE_LOCATION.name}
          destinationText={firstDestination?.address?.description || "Destino del cliente"}
        />
      )}

      <MapView
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Punto de Partida: Ubicación del camión o Almacén */}
        {hasValidDriverLocation && location ? (
          <Marker
            key="marker-driver-location"
            coordinate={location}
            title="🏢 Tu ubicación actual"
            description="Ubicación del chofer"
          >
            <Image
              source={require("@/assets/images/camion.png")}
              style={styles.truckIcon}
              resizeMode="contain"
            />
          </Marker>
        ) : (
          <Marker
            key="marker-warehouse-fallback"
            coordinate={WAREHOUSE_LOCATION}
            title="🏢 Punto de Partida"
            description={WAREHOUSE_LOCATION.name}
            pinColor="#2563EB"
          />
        )}

        {/* Punto de Llegada: Destinos de las órdenes */}
        {orders.map((order: any) =>
          order?.deliveries?.map((delivery: any, index: number) => {
            if (isValidCoord(delivery?.address?.latitude, delivery?.address?.longitude)) {
              return (
                <Marker
                  key={`marker-delivery-${order.id || index}-${index}`}
                  coordinate={{
                    latitude: Number(delivery.address.latitude),
                    longitude: Number(delivery.address.longitude),
                  }}
                  title={`📍 Llegada: ${order.userNames || ""} ${order.userLastNames || ""}`.trim()}
                  description={`${delivery.address.description || ""}${
                    delivery.address.additionalInfo
                      ? `, ${delivery.address.additionalInfo}`
                      : ""
                  }`}
                  pinColor="#DC2626"
                />
              );
            }
            return null;
          })
        )}

        {/* Trazo Vial Estilo Uber con Recorte Dinámico */}
        {routeCoordinates.length > 1 ? (
          <>
            {/* Capa 1: Sombra / Borde exterior */}
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#1E3A8A"
              strokeWidth={7}
            />
            {/* Capa 2: Línea central activa */}
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#2563EB"
              strokeWidth={4}
            />
          </>
        ) : destCoords && isValidCoord(destCoords.latitude, destCoords.longitude) ? (
          <Polyline
            coordinates={[
              { latitude: originCoords.latitude, longitude: originCoords.longitude },
              { latitude: destCoords.latitude, longitude: destCoords.longitude },
            ]}
            strokeColor="#2563EB"
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        ) : null}
      </MapView>

      {!hasValidDriverLocation && (
        <View style={styles.locatingBanner}>
          <Text style={styles.locatingText}>
            Buscando señal GPS del camión...
          </Text>
        </View>
      )}
    </View>
  );
};

export default DriverTripMap;

const styles = StyleSheet.create({
  container: {
    height: 380,
    marginBottom: 20,
    paddingTop: 10,
    position: "relative",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#0F294A",
  },
  map: {
    flex: 1,
    borderRadius: 12,
  },
  truckIcon: {
    width: 50,
    height: 50,
  },
  locatingBanner: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: "rgba(15, 41, 74, 0.85)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  locatingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
