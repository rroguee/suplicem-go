import { ORDER_PREFIX } from "@/constants/UserConstants";
import { useApprovedOrders } from "@/context/approvedOrderContext";
import { useLoading } from "@/context/loadingContext";
import { useMountEffect } from "@/hooks/lifeCicle";
import { getOrdersWithStatus } from "@/services/orderService";
import { createTrip } from "@/services/tripsService";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useAlert } from "@/context/alertContext";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ApprovedOrder = {
  trackingEnabled: any;
  id: string;
  userId: string;
  deliveryType: string;
  deliveries: { quantity: number }[];
  items: any[];
  comments: string;
  status: string;
  createdAt: string;
  orderNumber: string;
  userNames: string;
  userLastNames: string;
};

const CreateTripScreen: React.FC = () => {
  const [numberTrip, setNumberTrip] = useState("");
  const [comment, setComment] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [savedOrders, setSavedOrders] = useState<ApprovedOrder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [approvedOrdersTrip, setApprovedOrders] = useState<any[]>([]);
  const { approvedOrders } = useApprovedOrders();
  const { show, hide } = useLoading();
  const router = useRouter();
  const { showAlert } = useAlert();

  useMountEffect(async () => {
    try {
      show();
      console.log("🚀 Llamando getOrdersWithStatus...");
      const data = await getOrdersWithStatus("approved");
      console.log("📦 Respuesta:", data);

      if (data?.success && data?.orders?.length > 0) {
        const filteredOrders = data.orders?.filter(
          (order: any) => !order.tripId && order?.deliveryType === "domicilio"
        );
        setApprovedOrders(filteredOrders);
      }
    } catch (error) {
      console.error("❌ Error al obtener órdenes aprobadas:", error);
    } finally {
      hide();
    }
  });

  const toggleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    } else {
      setSelectedOrders((prev) => [...prev, orderId]);
    }
  };

  const handleSaveSelectedOrders = () => {
    const newlySelected = approvedOrders.filter((order) =>
      selectedOrders.includes(order.id)
    );

    const newUnique = newlySelected.filter(
      (order) => !savedOrders.some((saved) => saved.id === order.id)
    );

    setSavedOrders((prev) => [...prev, ...newUnique]);
    setModalVisible(false);
    setSelectedOrders([]);
  };

  const handleRemoveSavedOrder = (orderId: string) => {
    setSavedOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  const handleSubmit = async () => {
    if (!numberTrip || !comment) {
      showAlert({
        message: "Número de viaje y comentario son obligatorios",
        type: "error",
      });
      return;
    }

    if (savedOrders.length === 0) {
      showAlert({
        message: "Debe agregar al menos una orden",
        type: "error",
      });
      return;
    }

    if (
      savedOrders.some(
        (order) => !order.deliveries || order.deliveries.length === 0
      )
    ) {
      showAlert({
        message:
          "Hay una orden sin entregas. Todas las órdenes del viaje deben tener deliveries.",
        type: "error",
      });
      return;
    }

    const totalTons = savedOrders.reduce((sum, order) => {
      const orderTons = order.deliveries.reduce(
        (acc, delivery) => acc + (delivery.quantity || 0),
        0
      );
      return sum + orderTons;
    }, 0);

    if (totalTons <= 0) {
      showAlert({
        message:
          "HNo se puede crear un viaje sin toneladas asignadas a las órdenes seleccionadas.",
        type: "error",
      });
      return;
    }

    const orderIds = savedOrders.map((order) => order.id);

    try {
      show();
      await createTrip(numberTrip, orderIds, totalTons, comment);
      showAlert({
        message: "Viaje creado correctamente",
        type: "success",
      });
      // Limpia formulario y vuelve
      setNumberTrip("");
      setComment("");
      setSavedOrders([]);
      router.back();
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Hubo un problema al crear el viaje",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear Nuevo Viaje</Text>

      <Text style={styles.label}>Número de viaje</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: TRIP-001"
        placeholderTextColor="#999"
        value={numberTrip}
        onChangeText={setNumberTrip}
      />

      <Text style={styles.label}>
        {savedOrders.length > 0
          ? "Órdenes seleccionadas:"
          : "Agregar órdenes al viaje:"}
      </Text>

      {savedOrders.length > 0 && (
        <View style={styles.savedOrdersContainer}>
          {savedOrders.map((order) => (
            <View key={order.id} style={styles.savedOrderCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.savedOrderText}>
                  Orden: {`${ORDER_PREFIX.ORD}${order.orderNumber}`}
                </Text>
                <Text style={styles.savedOrderText}>
                  Cliente: {order.userNames} {order.userLastNames}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveSavedOrder(order.id)}
              >
                <Feather name="trash-2" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.buttonAddOrd}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Agregar Órdenes</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Órdenes Aprobadas</Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {approvedOrdersTrip.length > 0 ? (
                approvedOrdersTrip.map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={[
                      styles.orderCard,
                      selectedOrders.includes(order.id) &&
                        styles.orderCardSelected,
                    ]}
                    onPress={() => toggleSelectOrder(order.id)}
                  >
                    <Text>
                      Orden: {`${ORDER_PREFIX.ORD}${order.orderNumber}`}
                    </Text>
                    <Text>
                      Cliente: {order.userNames} {order.userLastNames}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ textAlign: "center", marginTop: 20 }}>
                  No hay órdenes disponibles
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveSelectedOrders}
              disabled={selectedOrders.length === 0}
            >
              <Text style={styles.saveButtonText}>Guardar seleccionadas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.label}>Comentario:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Detalles del viaje"
        placeholderTextColor="#999"
        value={comment}
        onChangeText={setComment}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Crear Viaje</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.saveButtonText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateTripScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff8f3",
    flexGrow: 1,
    paddingBottom: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: "#333",
    fontWeight: "bold",
    marginTop: 15,
  },
  button: {
    backgroundColor: "#A04A0E",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonAddOrd: {
    backgroundColor: "#A04A0E",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  orderCardSelected: {
    backgroundColor: "#e0ffe0",
    borderColor: "#4CAF50",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#F44336",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  savedOrdersContainer: {
    marginBottom: 10,
  },
  savedOrderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  savedOrderText: {
    color: "#333",
  },
});
