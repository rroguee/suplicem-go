import React from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "@/components/MapViewWrapper";
import { calculateTripEstimate, WAREHOUSE_LOCATION } from "@/utils/tripEstimate";

interface ClientOrderMapProps {
  driverLocation: { latitude: number; longitude: number } | null;
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

      {/* Banner de estimación de tiempo y puntos */}
      {estimate && (
        <View style={styles.estimateBanner}>
          <View style={styles.estimateHeader}>
            <Text style={styles.estimateTitle}>⏱️ Tiempo estimado de llegada:</Text>
            <Text style={styles.estimateValue}>{estimate.formattedText}</Text>
          </View>
          <Text style={styles.estimateRouteText}>
            🏢 Partida: {driverLocation ? "Camión en camino" : WAREHOUSE_LOCATION.name}
            {"\n"}📍 Llegada: {firstDelivery?.address?.description || "Dirección del cliente"}
          </Text>
        </View>
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
            key="client-map-truck"
            coordinate={driverLocation}
            title="🏢 Camión en ruta"
            description="Ubicación del chofer"
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

        {/* Línea de ruta entre Partida y Llegada */}
        {destCoords && (
          <Polyline
            coordinates={[
              { latitude: originCoords.latitude, longitude: originCoords.longitude },
              { latitude: destCoords.latitude, longitude: destCoords.longitude },
            ]}
            strokeColor="#E31E24"
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        )}
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
  estimateBanner: {
    backgroundColor: "#F0F7FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  estimateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  estimateTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1E40AF",
  },
  estimateValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E31E24",
  },
  estimateRouteText: {
    fontSize: 12,
    color: "#334155",
    lineHeight: 18,
  },
  map: {
    width: "100%",
    height: 260,
    borderRadius: 12,
  },
});
