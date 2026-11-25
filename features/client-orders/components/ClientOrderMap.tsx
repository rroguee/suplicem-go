import React from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "@/components/MapViewWrapper";
import { calculateTripEstimate, WAREHOUSE_LOCATION } from "@/utils/tripEstimate";
import { useTripRoute } from "@/hooks/useTripRoute";
import { TripEstimateBanner } from "@/components/trips/TripEstimateBanner";

interface ClientOrderMapProps {
  driverLocation: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  } | null;
  trip: any;
  deliveries?: any[];
  orderId?: string;
}

export const ClientOrderMap: React.FC<ClientOrderMapProps> = ({
  driverLocation,
  trip,
  deliveries,
  orderId,
}) => {
  const markerRef = React.useRef<any>(null);

  // Animación suave a 60 FPS hacia la nueva posición
  React.useEffect(() => {
    if (markerRef.current && driverLocation) {
      if (typeof markerRef.current.animateMarkerToCoordinate === "function") {
        markerRef.current.animateMarkerToCoordinate(
          {
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
          },
          3500
        );
      }
    }
  }, [driverLocation?.latitude, driverLocation?.longitude]);
  const firstDelivery = deliveries?.find(
    (d: any) => d?.address?.latitude && d?.address?.longitude
  );

  const originCoords = driverLocation || WAREHOUSE_LOCATION;
  const destCoords = firstDelivery?.address
    ? {
        latitude: Number(firstDelivery.address.latitude),
        longitude: Number(firstDelivery.address.longitude),
      }
    : null;

  const estimate = destCoords
    ? calculateTripEstimate(originCoords, destCoords)
    : null;

  const { routeCoordinates, roadEstimate } = useTripRoute({ originCoords, destCoords });

  const shouldShowMap =
    Boolean(destCoords) &&
    (Boolean(driverLocation) ||
      trip?.status === "accepted" ||
      trip?.status === "started" ||
      trip?.status === "in_progress");

  if (!shouldShowMap) return null;

  const centerLat = originCoords.latitude;
  const centerLng = originCoords.longitude;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Seguimiento y Ruta del Pedido</Text>

      {/* Banner de estimación de tiempo y puntos reutilizable */}
      {estimate && (
        <TripEstimateBanner
          title="Tiempo estimado de llegada"
          durationText={
            roadEstimate
              ? `${roadEstimate.formattedDuration} (${roadEstimate.formattedDistance})`
              : estimate.formattedText
          }
          originText={driverLocation ? "Camión en camino" : WAREHOUSE_LOCATION.name}
          destinationText={firstDelivery?.address?.description || "Dirección del cliente"}
        />
      )}

      <MapView
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Punto de Partida: Almacén u Ubicación actual del camión */}
        {driverLocation ? (
          <Marker
            ref={markerRef}
            key="client-map-truck"
            coordinate={driverLocation}
            title="🏢 Camión en ruta"
            description="Ubicación del chofer"
            rotation={driverLocation.heading || 0}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
          >
            <Image
              source={require("@/assets/images/camion.png")}
              style={{ width: 42, height: 42 }}
              resizeMode="contain"
            />
          </Marker>
        ) : (
          <Marker
            key="client-map-warehouse"
            coordinate={WAREHOUSE_LOCATION}
            title="🏢 Punto de Partida"
            description={WAREHOUSE_LOCATION.name}
            pinColor="#2563EB"
          />
        )}

        {/* Punto de Llegada: Dirección del cliente */}
        {destCoords && (
          <Marker
            key="client-map-destination"
            coordinate={destCoords}
            title="📍 Punto de Llegada"
            description={firstDelivery?.address?.description || "Su dirección de entrega"}
            pinColor="#DC2626"
          />
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
        ) : destCoords ? (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0F294A",
  },
  map: {
    width: "100%",
    height: 260,
    borderRadius: 12,
  },
});
