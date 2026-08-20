import CheckRender from "@/components/CheckRender";
import ConfirmationModal from "@/components/ConfirmationModal";
import { ORDER_PREFIX, ROLE } from "@/constants/UserConstants";
import { useAlert } from "@/context/alertContext";
import { AuthContext } from "@/context/authContext";
import { useLoading } from "@/context/loadingContext";
import { AcceptedTripContext } from "@/context/TripContext";
import { useMountEffect } from "@/hooks/lifeCicle";
import { markAsDelivered, orderDelivered } from "@/services/orderService";
import { sendDriverLocation, startOrCancelrip } from "@/services/tripsService";
import { formatRD } from "@/utils/currencyUtils";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const DriverOrderDetailScreen: React.FC = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const router = useRouter();
  const { trip, saveTrip } = useContext(AcceptedTripContext);
  const authContext = useContext(AuthContext);
  const [expandedOrderIndex, setExpandedOrderIndex] = useState<number | null>(
    null
  );
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

  // Nuevo estado para el modal de entrega
  const [isDeliveryModalVisible, setIsDeliveryModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<{
    orderId: string;
    deliveryIndex: number;
  } | null>(null);
  const [deliveryImage, setDeliveryImage] = useState<string | null>(null);
  const [deliveryComment, setDeliveryComment] = useState("");

  useMountEffect(async () => {
    if (trip?.status === "accepted" || trip?.status === "started") {
      startDriverLocationTracking();
    }
  });

  const startDriverLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      showAlert({
        message: "Se necesita acceso a la ubicación.",
        type: "warning",
      });
      return;
    }

    try {
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          if (authContext?.user?.userType === ROLE.DRIVER) {
            const { latitude, longitude } = location.coords;
            setLocation({ latitude, longitude });
            console.log("Enviando location");
            console.log("Latitud", latitude);
            console.log("Longitud", longitude);
            sendDriverLocation(latitude, longitude);
          }
        }
      );
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Error al rastrear la ubicación del conductor.",
        type: "error",
      });
    }
  };

  const handleStartTrip = async () => {
    if (!trip?.id) {
      showAlert({
        message: "Error: No se encontró el ID del viaje.",
        type: "error",
      });
      return;
    }

    try {
      show();
      console.log("🚚 Iniciando viaje con ID:", trip.id);

      const response = await startOrCancelrip(trip.id, "started");
      console.log("Respuesta iniciar viaje:", response);

      if (response.success) {
        let updatedTrip = trip;
        updatedTrip.status = "started";
        saveTrip(updatedTrip);
        showAlert({
          message: "Viaje iniciado. Puedes comenzar la ruta.",
          type: "success",
        });
      } else {
        showAlert({
          message: "Error: No se pudo iniciar el viaje.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error al iniciar viaje:", error);
      showAlert({
        message: "Error: Ocurrió un error al iniciar el viaje.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  function updateDeliveryStatus(
    trip: any,
    orderId: string,
    deliveryIndex: number,
    newStatus: string
  ): any {
    const updatedTrip = trip;

    const order = updatedTrip.orders.find((o: any) => o.id === orderId);

    if (
      order &&
      Array.isArray(order.deliveries) &&
      deliveryIndex >= 0 &&
      deliveryIndex < order.deliveries.length
    ) {
      order.deliveries[deliveryIndex].status = newStatus;
    } else {
      console.warn("Orden no encontrada o índice de delivery inválido");
    }

    return updatedTrip;
  }

  const handleOpenDeliveryModal = (orderId: string, deliveryIndex: number) => {
    setCurrentOrder({ orderId, deliveryIndex });
    setDeliveryImage(null);
    setDeliveryComment("");
    setIsDeliveryModalVisible(true);
  };

  const handleSendDelivery = async () => {
    if (!deliveryImage) {
      showAlert({
        message: "Debe subir una foto para marcar la entrega.",
        type: "warning",
      });
      return;
    }
    if (!deliveryComment) {
      showAlert({
        message: "Debe agregar un comentario a la entrega.",
        type: "warning",
      });
      return;
    }

    if (!currentOrder) return;

    try {
      show();
      console.log(
        "✅ Enviando entrega con foto y comentario:",
        currentOrder.orderId,
        deliveryImage,
        deliveryComment,
        currentOrder.deliveryIndex
      );

      const response = await markAsDelivered(
        currentOrder.orderId,
        deliveryImage,
        deliveryComment,
        currentOrder.deliveryIndex
      );
      
      console.log(
        "✅ Respuesta completa del servicio markAsDelivered:",
        response
      );

      if (response.success) {
        const responseDelivered = await orderDelivered(
          currentOrder.orderId,
          currentOrder.deliveryIndex
        );

        if (responseDelivered.success) {
          const updatedTrip = updateDeliveryStatus(
            trip,
            currentOrder.orderId,
            currentOrder.deliveryIndex,
            "delivered"
          );
          saveTrip(updatedTrip);
          showAlert({
            message: "Entrega marcada como realizada con éxito.",
            type: "success",
          });
          setIsDeliveryModalVisible(false);
        } else {
          showAlert({
            message: "Error: No se pudo marcar como entregado.",
            type: "error",
          });
        }
      } else {
        showAlert({
          message: "Error: No se pudo marcar como entregado.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error al marcar como entregado:", error);
      showAlert({
        message: "Error: Ocurrió un error al marcar la entrega.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlert({
        message: "Se necesita permiso para acceder a la galería.",
        type: "warning",
      });
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,

      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets![0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setDeliveryImage(manipResult.uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showAlert({
        message: "Se necesita permiso para acceder a la cámara.",
        type: "warning",
      });
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,

      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets![0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setDeliveryImage(manipResult.uri);
    }
  };

  const handleCancel = () => {
    setIsCancelModalVisible(true);
  };

  const confirmCancelTrip = async () => {
    setIsCancelModalVisible(false);
    if (!trip?.id) {
      showAlert({
        message: "Error: No se encontró el ID del viaje.",
        type: "error",
      });
      return;
    }

    try {
      show();
      console.log("🛑 Cancelando viaje con ID:", trip.id);
      const response = await startOrCancelrip(trip.id, "available");
      console.log("✅ Respuesta cancelar viaje:", response);

      if (response.success) {
        let updatedTrip = trip;
        updatedTrip.status = "canceled";
        saveTrip(updatedTrip);
        showAlert({
          message: "El viaje se ha cancelado correctamente.",
          type: "success",
        });
        router.back();
      } else {
        showAlert({
          message: "Error: No se pudo cancelar el viaje.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error al cancelar viaje:", error);
      showAlert({
        message: "Error: Ocurrió un error al cancelar el viaje.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const handleCompleteOrder = async () => {
    if (!trip?.id) {
      showAlert({
        message: "Error: No se encontró el ID del viaje.",
        type: "error",
      });
      return;
    }

    for (const tripOrder of trip.orders) {
      const allDelivered = tripOrder?.deliveries.every(
        (loc) => loc.status === "delivered"
      );
      if (!allDelivered) {
        showAlert({
          message:
            "Debes completar todas las entregas antes de finalizar el viaje.",
          type: "warning",
        });
        return;
      }
    }

    try {
      show();
      console.log("✅ Completando viaje con ID:", trip.id);

      const response = await startOrCancelrip(trip.id, "completed");
      console.log("📦 Respuesta completar viaje:", response);

      if (response.success) {
        let updatedTrip = trip;
        updatedTrip.status = "completed";
        saveTrip(updatedTrip);
        showAlert({
          message: "Viaje completado. Gracias por tu trabajo.",
          type: "success",
        });
        router.back();
      } else {
        showAlert({
          message: "Error: No se pudo completar el viaje.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error al completar viaje:", error);
      showAlert({
        message: "Error: Ocurrió un error al completar el viaje.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const handleCallClient = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsapp = (phone: string) => {
    // Asegúrate de que el número de teléfono esté en formato E.164 (con código de país)
    const formattedPhone = phone.startsWith("+") ? phone : `+1${phone}`; // Ejemplo para República Dominicana
    Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
  };

  const toggleOrder = (index: number) => {
    setExpandedOrderIndex((prev) => (prev === index ? null : index));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <Text style={styles.title}>Detalle del viaje: {trip?.tripNumber}</Text>

      <View style={styles.section}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ordenes</Text>
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
                      onPress={() => handleCallClient(order.userPhone)}
                    >
                      <Text style={styles.actionText}>
                        📞 Llamar al cliente
                      </Text>
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
                            {/* Se agregó el campo adicional de forma condicional */}
                            {delivery.address?.additionalInfo &&
                            delivery.address.additionalInfo
                              ? `, ${delivery.address.additionalInfo}`
                              : ""}
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
                          <CheckRender
                            allowed={delivery.status === "delivered"}
                          >
                            <Text style={[styles.delivered]}>✅ Entregado</Text>
                          </CheckRender>
                          <CheckRender
                            allowed={
                              delivery.status !== "delivered" &&
                              trip.status === "started"
                            }
                          >
                            <TouchableOpacity
                              style={styles.deliverButton}
                              onPress={() =>
                                handleOpenDeliveryModal(order?.id, index)
                              }
                            >
                              <Text style={styles.deliverButtonText}>
                                Marcar como entregado
                              </Text>
                            </TouchableOpacity>
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
        <Text style={styles.value}>
          Comentarios: {trip?.comments || "Ninguno"}
        </Text>
      </View>

      <View style={styles.actions}>
        <CheckRender allowed={trip?.status === "accepted"}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartTrip}
          >
            <Text style={styles.actionText}>Iniciar viaje</Text>
          </TouchableOpacity>
        </CheckRender>

        <CheckRender allowed={trip?.status === "started"}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteOrder}
          >
            <Text style={styles.actionText}>Completar viaje</Text>
          </TouchableOpacity>
        </CheckRender>

        <CheckRender
          allowed={trip?.status !== "completed" && trip?.status !== "canceled"}
        >
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.actionText}>Cancelar viaje</Text>
          </TouchableOpacity>
        </CheckRender>
      </View>

      {location &&
        (trip?.status === "accepted" || trip?.status === "started") && (
          <View style={{ height: 300, marginBottom: 20, paddingTop: 20 }}>
            <MapView
              style={{ flex: 1, borderRadius: 10 }}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              <Marker.Animated
                coordinate={location}
                title="Tu ubicación"
                description="Ubicación actual"
              >
                <Image
                  source={require("@/assets/images/camion.png")}
                  style={{ width: 50, height: 50 }}
                  resizeMode="contain"
                />
              </Marker.Animated>

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
                        description={`${delivery.address.description}${
                          delivery.address.additionalInfo &&
                          delivery.address.additionalInfo
                            ? `, ${delivery.address.additionalInfo}`
                            : ""
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

      <ConfirmationModal
        visible={isCancelModalVisible}
        title="Cancelar viaje"
        message="¿Estás seguro de que deseas cancelar este viaje?"
        onConfirm={confirmCancelTrip}
        onCancel={() => setIsCancelModalVisible(false)}
        confirmText="Sí, cancelar"
        cancelText="No, volver"
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isDeliveryModalVisible}
        onRequestClose={() => setIsDeliveryModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Marcar como entregado</Text>
            <Text style={styles.modalSubTitle}>
              Sube una foto como prueba de entrega y añade un comentario.
            </Text>

            {deliveryImage && (
              <Image
                source={{ uri: deliveryImage }}
                style={styles.deliveryImage}
              />
            )}

            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <Text style={styles.photoButtonText}>Tomar foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Text style={styles.photoButtonText}>Galería</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Añadir comentario..."
              placeholderTextColor="#999"
              style={styles.commentInput}
              multiline={true}
              value={deliveryComment}
              onChangeText={setDeliveryComment}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleSendDelivery}
              >
                <Text style={styles.modalButtonText}>Enviar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setIsDeliveryModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default DriverOrderDetailScreen;

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
  deliverButton: {
    backgroundColor: "#FF7F32",
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  deliverButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  delivered: {
    marginTop: 8,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  actions: {
    marginTop: 30,
    gap: 12,
  },
  startButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  callButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  whatsappButton: {
    backgroundColor: "#25D366", // Color verde de WhatsApp
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: "#F44336",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  completeButton: {
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSubTitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  deliveryImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  photoActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  photoButton: {
    backgroundColor: "#A04A0E",
    padding: 10,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  photoButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  commentInput: {
    width: "100%",
    minHeight: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "48%",
  },
  sendButton: {
    backgroundColor: "#4CAF50",
  },
  closeButton: {
    backgroundColor: "#F44336",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
