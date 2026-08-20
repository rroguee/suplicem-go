import CheckRender from "@/components/CheckRender";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { useLoading } from "@/context/loadingContext";
import { useOrders } from "@/context/orderContext";
import { getDriverLocation, getTripByOrderId } from "@/services/tripsService";
import { formatRD } from "@/utils/currencyUtils";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
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

const TRACKING_STEPS = ["Pendiente de iniciar", "En camino", "Completado"];

const OrderDetailScreen: React.FC = () => {
  const { orders } = useOrders();
  const { show, hide } = useLoading();
  const { orderId } = useLocalSearchParams();
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [trip, setTrip] = useState<any>(null);

  // Encontrar la orden basándose en el ID de la URL
  const selectedOrder = orders.find((order) => order.id === orderId);

  useFocusEffect(
    useCallback(() => {
      // Asegúrate de que la orden seleccionada exista antes de continuar
      if (!selectedOrder) return;
      show();
      refreshDriverLocationAndTripStatus();
      hide();

      const interval = setInterval(() => {
        refreshDriverLocationAndTripStatus();
      }, 8000);

      return () => clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOrder?.id])
  );

  const refreshDriverLocationAndTripStatus = async () => {
    // Asegúrate de que la orden seleccionada exista antes de hacer la llamada
    if (!selectedOrder) return;

    const tripResponse = await getTripByOrderId(selectedOrder.id);
    console.log("tripResponse");
    console.log(tripResponse);

    if (tripResponse?.success && tripResponse?.trip) {
      setTrip(tripResponse?.trip);
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

  if (!selectedOrder) {
    return (
      <View style={styles.container}>
        <Text>No se encontró información de la orden.</Text>
      </View>
    );
  }

  const translateStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "requested":
        return "Solicitud enviada";
      case "on_the_way":
        return "En camino";
      case "delivered":
        return "Entregado";
      case "approved":
        return "Aprobado";
      default:
        return status;
    }
  };

  const renderStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFC107";
      case "requested":
        return "#03A9F4";
      case "on_the_way":
        return "#FF9800";
      case "delivered":
      case "approved":
        return "#4CAF50";
      default:
        return "#999";
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

  const handleCallDriver = () => {
    if (trip?.driver?.phone) {
      Linking.openURL(`tel:${trip?.driver?.phone}`);
    }
  };

  const handleWhatsapp = (phone: string) => {
    if (phone) {
      const formattedPhone = phone.startsWith("+") ? phone : `+1${phone}`;
      Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text style={styles.title}>Detalle de Orden</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Número de Orden:</Text>
        <Text style={styles.value}>
          {ORDER_PREFIX.ORD}
          {selectedOrder.orderNumber}
        </Text>
        <View style={{ marginBottom: 10 }} />
        <CheckRender allowed={trip !== null}>
          <Text style={styles.label}>Número de Viaje:</Text>
          <Text style={styles.value}>{trip?.tripNumber}</Text>

          <View style={{ marginBottom: 10 }} />
        </CheckRender>

        <CheckRender allowed={trip?.assignedDriverId}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos del conductor</Text>
            <Text style={styles.value}>
              👤 {trip?.driver?.names} {trip?.driver?.lastNames}
            </Text>
            <Text style={styles.value}>📞 {trip?.driver?.phone}</Text>
          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCallDriver}
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
          <Text style={styles.sectionTitle}>Productos</Text>
          {selectedOrder.items.map((item, index) => (
            <View key={index} style={styles.productCard}>
              <Text style={styles.productTitle}>🛒 Producto {index + 1}</Text>
              <Text style={styles.productLine}>
                📄 <Text style={styles.bold}>Descripción:</Text> {item.name}
              </Text>
              <Text style={styles.productLine}>
                📦 <Text style={styles.bold}>Cantidad:</Text> {item.quantity}{" "}
                {item.unit}
              </Text>
              <Text style={styles.productLine}>
                💰 <Text style={styles.bold}>Monto total:</Text>{" "}
                {formatRD(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>
        {selectedOrder.deliveries?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Entregas</Text>
            <View style={styles.deliveriesContainer}>
              {selectedOrder.deliveries.map((delivery, idx) => (
                <View key={idx} style={styles.deliveryCard}>
                  <Text style={styles.deliveryAddress}>
                    📍 {delivery.address?.description}
                    {delivery.address?.additionalInfo &&`, ${delivery.address.additionalInfo}`}
                  </Text>
                  <Text style={styles.value}>
                    🪣{" "}
                    {
                      selectedOrder?.items?.find(
                        (o) => o.productId === delivery.productId
                      )?.name
                    }{" "}
                    - {delivery.quantity} {delivery.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {selectedOrder.comments && (
          <>
            <Text style={styles.label}>Comentarios:</Text>
            <Text style={styles.value}>{selectedOrder.comments}</Text>
          </>
        )}
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

              {selectedOrder?.deliveries?.map(
                (delivery: any, index: number) => {
                  if (
                    delivery?.address?.latitude &&
                    delivery?.address?.longitude
                  ) {
                    return (
                      <Marker
                        key={`${selectedOrder.id}-${index}`}
                        coordinate={{
                          latitude: delivery.address.latitude,
                          longitude: delivery.address.longitude,
                        }}
                        title={"📍 Punto de entrega"}
                        description={`${delivery.address.description}${
                          delivery.address.additionalInfo && `, ${delivery.address.additionalInfo}`
                        }`}
                        pinColor="green"
                      />
                    );
                  }
                  return null;
                }
              )}
            </MapView>
          </View>
        )}
    </ScrollView>
  );
};

export default OrderDetailScreen;

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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginTop: 6,
  },
  value: {
    fontSize: 16,
    color: "#222",
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
  deliveriesContainer: {
    marginBottom: -20,
  },
  deliveriesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  deliveryCard: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  deliveryAddress: {
    fontSize: 16,
    color: "#333",
  },
  deliveryItem: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
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
  whatsappButton: {
    backgroundColor: "#25D366",
    marginTop: 8,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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
});
