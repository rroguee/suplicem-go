import React from "react";
import { Image, StyleSheet, View, Text, Platform } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "@/components/MapViewWrapper";
import { calculateTripEstimate, WAREHOUSE_LOCATION } from "@/utils/tripEstimate";

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

  const initialLatitude = originCoords.latitude;
  const initialLongitude = originCoords.longitude;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ruta y Tiempo Estimado de Viaje</Text>

      {/* Banner de estimación de tiempo y ruta */}
      {estimate && (
        <View style={styles.estimateBanner}>
          <View style={styles.estimateHeader}>
            <Text style={styles.estimateTitle}>⏱️ Tiempo estimado de trayecto:</Text>
            <Text style={styles.estimateValue}>{estimate.formattedText}</Text>
          </View>
          <Text style={styles.estimateRouteText}>
            🏢 Partida: {hasValidDriverLocation ? "Ubicación del camión" : WAREHOUSE_LOCATION.name}
            {"\n"}📍 Llegada: {firstDestination?.address?.description || "Destino del cliente"}
          </Text>
        </View>
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

        {/* Línea de Ruta de Partida a Llegada */}
        {destCoords && isValidCoord(destCoords.latitude, destCoords.longitude) && (
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
  estimateBanner: {
    backgroundColor: "#F0F7FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  estimateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
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
    flex: 1,
    borderRadius: 10,
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
