import CheckRender from "@/components/CheckRender";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { useLoading } from "@/context/loadingContext";
import { AcceptedTripContext } from "@/context/TripContext";
import { getDriverLocation, getTripDetail } from "@/services/tripsService";
import { formatRD } from "@/utils/currencyUtils";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { statusMap } from "../../(orders)/(driver)/driver-trips";

const TripDetailScreen: React.FC = () => {
  const { trip, saveTrip } = useContext(AcceptedTripContext);
  const TRACKING_STEPS = ["Pendiente de iniciar", "En camino", "Completado"];
  const { show, hide } = useLoading();
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [expandedOrderIndex, setExpandedOrderIndex] = useState<number | null>(
    null
  );

  useFocusEffect(
    useCallback(() => {
      show();
      refreshDriverLocationAndTripStatus();
      hide();

      const interval = setInterval(() => {
        refreshDriverLocationAndTripStatus();
      }, 8000);

      // Limpieza al perder el foco
      return () => clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trip?.id])
  );

  const refreshDriverLocationAndTripStatus = async () => {
    const tripResponse = await getTripDetail(trip?.id!);
    console.log("tripResponse");
    console.log(tripResponse);

    if (tripResponse?.success && tripResponse?.trip) {
      saveTrip(tripResponse?.trip);
      if (
        tripResponse?.trip?.status === "accepted" ||
        tripResponse?.trip?.status === "started"
      ) {
        const driverLocationResponse = await getDriverLocation(
          tripResponse?.trip?.assignedDriverId
        );
        console.log("driverLocationResponse");
        console.log(driverLocationResponse);
        if (
          driverLocationResponse?.success &&
          driverLocationResponse?.location
        ) {
          setDriverLocation({
            latitude: driverLocationResponse?.location?.lat,
            longitude: driverLocationResponse?.location?.lng,
          });
        }
      }
    }
  };

  const getStepCompleted = (step: string) => {
    const stepIndex = TRACKING_STEPS.indexOf(step);
    const currentIndex = TRACKING_STEPS.indexOf(
      trip?.status === "accepted"
        ? "Pendiente de iniciar"
        : trip?.status === "started"
        ? "En camino"
        : trip?.status === "completed"
        ? "Completado"
        : ""
    );
    return stepIndex <= currentIndex;
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsapp = (phone: string) => {
    const formattedPhone = phone.startsWith("+") ? phone : `+1${phone}`;
    Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
  };

  const toggleOrder = (index: number) => {
    setExpandedOrderIndex((prev) => (prev === index ? null : index));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text style={styles.title}>Detalle del viaje: {trip?.tripNumber}</Text>

      <Text style={styles.sectionTitle}>
        Estado del viaje: {statusMap[trip?.status!]?.text || trip?.status}
      </Text>

      <CheckRender allowed={trip?.driver}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del conductor</Text>
          <Text style={styles.value}>
            👤 {trip?.driver?.names} {trip?.driver?.lastNames}
          </Text>
          <Text style={styles.value}>📞 {trip?.driver?.phone}</Text>
        </View>

        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCall(trip?.driver?.phone)}
        >
          <Text style={styles.actionText}>📞 Llamar al conductor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.callButton, styles.whatsappButton]}
          onPress={() => handleWhatsapp(trip?.driver?.phone)}
        >
          <Text style={styles.actionText}>💬 Chat en WhatsApp</Text>
        </TouchableOpacity>
        <View style={{ marginBottom: 10 }} />
      </CheckRender>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Órdenes</Text>
        {trip?.orders?.map((order, index) => {
          const isExpanded = expandedOrderIndex === index;

          return (
            <View
              key={index}
              style={[
                styles.value,
                {
                  borderBottomWidth: 1,
                  borderBottomColor: "#ccc",
                  paddingBottom: 10,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => toggleOrder(index)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.label}>
                  {`${ORDER_PREFIX.ORD}${order?.orderNumber}`}
                </Text>
                <Text style={{ fontSize: 18 }}>{isExpanded ? "▲" : "▼"}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <>
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Datos del cliente</Text>
                    <Text style={styles.value}>
                      👤 {order.userNames} {order.userLastNames}
                    </Text>
                    <Text style={styles.value}>📞 {order.userPhone}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(order.userPhone)}
                  >
                    <Text style={styles.actionText}>📞 Llamar al cliente</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.callButton, styles.whatsappButton]}
                    onPress={() => handleWhatsapp(order.userPhone)}
                  >
                    <Text style={styles.actionText}>💬 Chat en WhatsApp</Text>
                  </TouchableOpacity>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Productos</Text>
                    {order.items.map((item, index) => (
                      <View key={index} style={styles.productCard}>
                        <Text style={styles.productTitle}>
                          🛒 Producto {index + 1}
                        </Text>
                        <Text style={styles.productLine}>
                          📄 <Text style={styles.bold}>Descripción:</Text>{" "}
                          {item.name}
                        </Text>
                        <Text style={styles.productLine}>
                          📦 <Text style={styles.bold}>Cantidad:</Text>{" "}
                          {item.quantity} {item.unit}
                        </Text>
                        <Text style={styles.productLine}>
                          💰 <Text style={styles.bold}>Monto total:</Text>{" "}
                          {formatRD(item.subtotal)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      Direcciones de entrega
                    </Text>
                    {order?.deliveries?.map((delivery, index) => (
                      <View
                        key={delivery.productId}
                        style={styles.deliveryCard}
                      >
                        <Text style={styles.value}>
                          📍 {delivery.address?.description}
                          {delivery.address?.additionalInfo && `, ${delivery.address.additionalInfo}`}
                        </Text>
                        <Text style={styles.value}>
                          🪣{" "}
                          {
                            order?.items?.find(
                              (o) => o.productId === delivery.productId
                            )?.name
                          }{" "}
                          - {delivery.quantity} {delivery.unit}
                        </Text>
                        <CheckRender allowed={delivery.status === "delivered"}>
                          <Text style={[styles.delivered]}>✅ Entregado</Text>
                        </CheckRender>

                        <CheckRender allowed={!!delivery?.imageUrl}>
                          <View style={styles.imageContainer}>
                            <Text style={styles.imageTitle}>
                              Foto de entrega:
                            </Text>
                            <Image
                              source={{ uri: delivery?.imageUrl }}
                              style={styles.deliveryImage}
                              resizeMode="cover"
                            />
                          </View>
                        </CheckRender>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seguimiento del pedido</Text>
        {TRACKING_STEPS.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: getStepCompleted(step) ? "#4CAF50" : "#ccc",
                },
              ]}
            />
            <Text style={styles.stepLabel}>{step}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.value}>
        Comentarios del viaje: {trip?.comments || "Ninguno"}
      </Text>

      {driverLocation &&
        trip?.assignedDriverId &&
        (trip?.status === "accepted" || trip?.status === "started") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación actual del camión</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker.Animated
                coordinate={driverLocation}
                title="Camión"
                description="Ubicación actual"
              >
                <Image
                  source={require("@/assets/images/camion.png")}
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />
              </Marker.Animated>

              {/* Marcadores de direcciones de entrega */}
              {trip?.orders?.map((order) =>
                order?.deliveries?.map((delivery, index) => {
                  if (
                    delivery?.address?.latitude &&
                    delivery?.address?.longitude
                  ) {
                    return (
                      <Marker
                        key={`${order.id}-${index}`}
                        coordinate={{
                          latitude: delivery.address.latitude,
                          longitude: delivery.address.longitude,
                        }}
                        title={`👤: ${order.userNames} ${order.userLastNames}`}
                        // Se actualizó la descripción para el marcador
                        description={`${delivery.address.description}${
                          delivery.address.additionalInfo && `, ${delivery.address.additionalInfo}`
                        }`}
                        pinColor="green"
                      />
                    );
                  }
                  return null;
                })
              )}
            </MapView>
          </View>
        )}
    </ScrollView>
  );
};

export default TripDetailScreen;

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
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: "#333",
    marginBottom: 2,
  },
  deliveryCard: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  delivered: {
    marginTop: 8,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  stepLabel: {
    fontSize: 16,
  },
  map: {
    width: Dimensions.get("window").width - 32,
    height: 200,
    borderRadius: 10,
  },
  callButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    marginTop: 8,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  productLine: {
    fontSize: 15,
    color: "#444",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "600",
    color: "#222",
  },
  // ESTILOS MEJORADOS
  imageContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imageTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  deliveryImage: {
    width: "100%",
    height: 250, // Aumenté la altura para que sea más visible
    borderRadius: 10, // Un borde redondeado más pronunciado
  },
});
