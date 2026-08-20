import AddressPicker from "@/components/AddressPicker";
import CustomPickerModal from "@/components/CustomPickerModal";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { useOrders } from "@/context/orderContext";
import {
  approveOrder as approveOrderService,
  rejectedOrder,
} from "@/services/orderService";
import { getUsers } from "@/services/userService";
import { Address } from "@/types/users";
import { formatRD } from "@/utils/currencyUtils";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface User {
  uid: string;
  identificationType: string;
  identification: string;
  email: string;
  names: string;
  lastNames: string;
  userType: "client" | "admin" | "driver";
  phone?: string;
  addresses?: Address[];
}

interface OrderDelivery {
  id: string;
  productId: string;
  address: Address;
  quantity: number;
  unit: string;
  availableAddresses?: Address[];
}

interface OrderWithAddresses {
  userAddresses: Address[];
  id: string;
  orderNumber: string;
  userId: string; // Asegurarse de que el tipo tiene el userId
  deliveryType: string;
  deliveries: OrderDelivery[];
  items: any[];
  comments?: string;
  status: string;
  declineReason?: string;
  userNames: string;
  userLastNames: string;
  userPhone?: string;
}

const isValidCedula = (value: string) => {
  if (!/^\d{11}$/.test(value)) return false;
  const digits = value.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let tmp = digits[i] * (i % 2 === 0 ? 1 : 2);
    if (tmp > 9) tmp -= 9;
    sum += tmp;
  }
  return (10 - (sum % 10)) % 10 === digits[10];
};

const AdminOrderDetailScreen: React.FC = () => {
  const { orders, updateOrder } = useOrders();
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const { orderId } = useLocalSearchParams();

  const selectedOrder = orders.find((o) => o.id === orderId);

  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDeliveryType, setEditedDeliveryType] = useState("");
  const [editedDeliveries, setEditedDeliveries] = useState<OrderDelivery[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddressData, setNewAddressData] = useState({
    placeId: "",
    description: "",
    latitude: 0,
    longitude: 0,
    recipientName: "",
    recipientDocument: "",
    recipientDocumentType: "Cédula",
    additionalInfo: "",
  });

  useEffect(() => {
    if (selectedOrder) {
      console.log("Detalles de la orden:", selectedOrder);
    }
  }, [selectedOrder]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        if (response.success) {
          const clients = response.users.filter(
            (user: User) => user.userType === "client"
          );
          setUsers(clients);
          console.log("Usuarios clientes obtenidos:", clients);
        } else {
          showAlert({
            message: "No se pudieron cargar los usuarios.",
            type: "error",
          });
        }
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        showAlert({
          message: "Error de red al cargar usuarios.",
          type: "error",
        });
      }
    };
    fetchUsers();
  }, []);

  const approveOrder = async () => {
    if (!selectedOrder) return;
    try {
      show();
      const response = await approveOrderService(selectedOrder.id);
      if (response.success) {
        updateOrder(selectedOrder.id, { status: "approved" });
        showAlert({
          message: "Orden aprobada correctamente.",
          type: "success",
        });
      } else {
        showAlert({ message: "No se pudo aprobar la orden.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Ocurrió un error al aprobar la orden.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const rejectOrder = async () => {
    if (!selectedOrder) return;

    if (!declineReason || declineReason.trim() === "") {
      setModalVisible(false);
      showAlert({
        message: "Debe escribir un motivo para rechazar la orden.",
        type: "warning",
      });
      return;
    }

    try {
      show();
      const response = await rejectedOrder(selectedOrder.id, declineReason);
      if (response.success) {
        updateOrder(selectedOrder.id, {
          status: "rejected",
          declineReason: declineReason,
        });
        setModalVisible(false);
        setDeclineReason("");
        showAlert({
          message: "Orden rechazada correctamente.",
          type: "success",
        });
      } else {
        showAlert({ message: "No se pudo rechazar la orden.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Ocurrió un error al rechazar la orden.",
        type: "error",
      });
    } finally {
      hide();
    }
  };
  const handleEdit = () => {
    if (!selectedOrder) {
      showAlert({
        message: "No se pudo encontrar la orden.",
        type: "error",
      });
      return;
    }
    if (users.length === 0) {
      showAlert({
        message: "Cargando usuarios, por favor espera un momento.",
        type: "info",
      });
      return;
    }

    setIsEditing(true);
    setEditedDeliveryType(selectedOrder.deliveryType || "");

    const newEditedDeliveries = selectedOrder.deliveries.map((delivery) => {
      let availableAddresses: any[] = [];
      let addressWithUserUid = delivery.address;

      // Usar el userUid que viene con la dirección de la entrega,
      // o el de la orden principal si no existe.
      const deliveryUserUid = delivery.address?.userUid || selectedOrder.userId;

      const userForThisDelivery = users.find(
        (user) => user.uid === deliveryUserUid
      );

      if (userForThisDelivery) {
        availableAddresses = userForThisDelivery.addresses || [];

        // Verificar si la dirección actual de la entrega ya está en la lista de direcciones del usuario
        // Esto es para el caso de nuevas direcciones
        const addressExistsInList = availableAddresses.some(
          (addr) => addr.placeId === delivery.address.placeId
        );

        // Si la dirección no está en la lista, la agregamos
        if (!addressExistsInList && delivery.address.placeId) {
          availableAddresses = [delivery.address, ...availableAddresses];
        }

        addressWithUserUid = {
          ...delivery.address,
          userUid: deliveryUserUid,
        };
      }

      return {
        ...delivery,
        address: addressWithUserUid,
        availableAddresses: availableAddresses,
      };
    });

    setEditedDeliveries(newEditedDeliveries);
  };
  const handleSave = async () => {
    const hasEmptyProduct = editedDeliveries.some(
      (delivery) => !delivery.productId || delivery.productId.length === 0
    );

    if (hasEmptyProduct) {
      showAlert({
        message:
          "Por favor, selecciona un producto para todas las entregas antes de guardar.",
        type: "error",
      });
      return;
    }

    show();

    try {
      // Aquí iría tu llamada API para guardar los cambios en el servidor
      // Por ahora, solo es una simulación
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Actualiza la orden en el contexto con los datos editados
      if (selectedOrder) {
        updateOrder(selectedOrder.id, {
          deliveryType: editedDeliveryType,
          deliveries: editedDeliveries.map(
            ({ availableAddresses, ...rest }) => rest
          ),
        });
      }

      showAlert({
        message: "Cambios guardados correctamente.",
        type: "success",
      });

      // No reiniciamos el estado de editedDeliveries, solo salimos del modo edición.
      setIsEditing(false);
    } catch (error) {
      console.error("Error en la simulación del servicio:", error);
      showAlert({
        message: "Ocurrió un error al guardar los cambios.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const addDelivery = () => {
    const newDelivery: OrderDelivery = {
      id: Math.random().toString(36).substring(2, 9),
      productId: "",
      address: {
        placeId: "",
        description: "",
        latitude: 0,
        longitude: 0,
        additionalInfo: "",
        recipientName: "",
        recipientDocument: "",
        recipientDocumentType: "",
        // userUid se inicializa como vacío para que el picker esté en blanco
        userUid: "",
      },
      quantity: 0,
      unit: "fundas",
      availableAddresses: [],
    };
    setEditedDeliveries((prevDeliveries) => [...prevDeliveries, newDelivery]);
    console.log(
      "Nueva entrega agregada. Entregas actuales:",
      editedDeliveries.length + 1
    );
  };

  const updateDelivery = (id: string, newValues: Partial<OrderDelivery>) => {
    console.log(
      `Actualizando entrega con ID ${id} con los valores:`,
      newValues
    );
    const updated = editedDeliveries.map((delivery) => {
      if (delivery.id === id) {
        if (newValues.address) {
          return {
            ...delivery,
            ...newValues,
            address: {
              ...delivery.address,
              ...newValues.address,
            },
          };
        }
        return { ...delivery, ...newValues };
      }
      return delivery;
    });
    setEditedDeliveries(updated);
  };

  const removeDelivery = (id: string) => {
    console.log(`Intentando eliminar entrega con ID ${id}.`);
    const updated = editedDeliveries.filter((delivery) => delivery.id !== id);
    setEditedDeliveries(updated);
    console.log(`Entrega eliminada. Nuevo número de entregas:`, updated.length);
  };

  const productOptions =
    selectedOrder?.items.map((item) => ({
      label: `${item.name}`,
      value: item.productId,
    })) || [];

  const documentTypeOptions = [
    { label: "Cédula", value: "Cédula" },
    { label: "Pasaporte", value: "Pasaporte" },
  ];

  const handleUserSelection = (userId: string, deliveryId: string) => {
    setEditedDeliveries((prevDeliveries) =>
      prevDeliveries.map((delivery) => {
        if (delivery.id === deliveryId) {
          const user = users.find((u) => u.uid === userId);
          const userAddresses = user?.addresses || [];

          const newAddressState: Address = {
            placeId: "",
            description: "",
            latitude: 0,
            longitude: 0,
            recipientName: "",
            recipientDocument: "",
            recipientDocumentType: "",
            additionalInfo: "",
            userUid: userId,
          };

          return {
            ...delivery,
            address: newAddressState,
            availableAddresses: userAddresses,
          };
        }
        return delivery;
      })
    );
  };

  const handleAddNewAddress = () => {
    if (
      !newAddressData.description ||
      !newAddressData.recipientName ||
      !newAddressData.recipientDocument ||
      !newAddressData.recipientDocumentType ||
      !newAddressData.additionalInfo
    ) {
      setIsAddingNewAddress(false);
      showAlert({
        message: "Todos los campos de la dirección son obligatorios.",
        type: "warning",
      });
      return;
    }

    if (newAddressData.recipientDocumentType === "Cédula") {
      if (!isValidCedula(newAddressData.recipientDocument)) {
        setIsAddingNewAddress(false);
        showAlert({
          message: "El número de cédula no es válido.",
          type: "warning",
        });
        return;
      }
    } else if (newAddressData.recipientDocumentType === "Pasaporte") {
      if (!/^[A-Z0-9]{6,12}$/i.test(newAddressData.recipientDocument)) {
        setIsAddingNewAddress(false);
        showAlert({
          message:
            "El pasaporte no es válido (letras y números, 6-12 caracteres).",
        });
        return;
      }
    }

    const newUserUid = `new-user-${Date.now()}`;

    const newTempUser: User = {
      uid: newUserUid,
      names: newAddressData.recipientName,
      lastNames: "",
      identification: newAddressData.recipientDocument,
      identificationType: newAddressData.recipientDocumentType,
      email: "",
      userType: "client",
      addresses: [],
    };

    const newAddress: Address = {
      ...newAddressData,
      placeId: `new-${Date.now()}`,
      userUid: newUserUid,
    };

    const newDelivery: OrderDelivery = {
      id: Math.random().toString(36).substring(2, 9),
      productId: "",
      quantity: 0,
      unit: "fundas",
      address: newAddress,
      availableAddresses: [newAddress],
    };

    setUsers((prevUsers) => [...prevUsers, newTempUser]);
    setEditedDeliveries((prevDeliveries) => [...prevDeliveries, newDelivery]);

    setIsAddingNewAddress(false);
    setNewAddressData({
      placeId: "",
      description: "",
      latitude: 0,
      longitude: 0,
      recipientName: "",
      recipientDocument: "",
      recipientDocumentType: "Cédula",
      additionalInfo: "",
    });
    showAlert({
      message: "Nueva entrega con dirección agregada.",
      type: "success",
    });
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
      case "requested":
        return "Pendiente";
      case "on_the_way":
        return "En camino";
      case "delivered":
        return "Entregado";
      case "approved":
        return "Aprobado";
      case "rejected":
        return "Rechazado";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "requested":
        return "#FFC107";
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      case "on_the_way":
        return "#03A9F4";
      case "delivered":
        return "#4CAF50";
      default:
        return "#999";
    }
  };

  const getAvailableQuantity = (
    productId: string,
    currentDeliveryId: string
  ) => {
    const totalOrderedQuantity =
      selectedOrder.items.find((item) => item.productId === productId)
        ?.quantity || 0;

    const allocatedQuantity = editedDeliveries.reduce((sum, delivery) => {
      if (
        delivery.productId === productId &&
        delivery.id !== currentDeliveryId
      ) {
        return sum + delivery.quantity;
      }
      return sum;
    }, 0);

    return Math.max(0, totalOrderedQuantity - allocatedQuantity);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.title}>Detalle de Orden</Text>

        {(selectedOrder.status === "pending" ||
          selectedOrder.status === "requested") &&
          !isEditing && (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.buttonText}>Editar Orden</Text>
            </TouchableOpacity>
          )}

        <View style={[styles.section, styles.clientInfoSection]}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          <Text style={styles.clientInfoText}>
            👤 {selectedOrder.userNames} {selectedOrder.userLastNames}
          </Text>
          <Text style={styles.clientInfoText}>
            📞 {selectedOrder.userPhone || "No disponible"}
          </Text>
          <View style={styles.deliveryTypeContainer}>
            <Text style={styles.deliveryTypeLabel}>Tipo de entrega:</Text>
            {isEditing ? (
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[
                    styles.segmentedButton,
                    editedDeliveryType === "domicilio" &&
                      styles.segmentedButtonActive,
                  ]}
                  onPress={() => setEditedDeliveryType("domicilio")}
                >
                  <Text
                    style={[
                      styles.segmentedButtonText,
                      editedDeliveryType === "domicilio" &&
                        styles.segmentedButtonTextActive,
                    ]}
                  >
                    Domicilio
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentedButton,
                    editedDeliveryType === "almacen" &&
                      styles.segmentedButtonActive,
                  ]}
                  onPress={() => setEditedDeliveryType("almacen")}
                >
                  <Text
                    style={[
                      styles.segmentedButtonText,
                      editedDeliveryType === "almacen" &&
                        styles.segmentedButtonTextActive,
                    ]}
                  >
                    Almacén
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.deliveryTypeText}>
                {selectedOrder.deliveryType}
              </Text>
            )}
          </View>
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entregas</Text>
          <View style={styles.deliveriesContainer}>
            {(isEditing ? editedDeliveries : selectedOrder.deliveries).map(
              (delivery, idx) => (
                <View key={delivery.id} style={styles.deliveryCard}>
                  {isEditing && editedDeliveryType === "domicilio" ? (
                    <View>
                      <Text style={styles.deliveryEditLabel}>Usuario</Text>
                      <CustomPickerModal
                        label="Seleccionar usuario"
                        selectedValue={delivery.address?.userUid ?? ""} // <-- Correcto
                        onValueChange={(value) =>
                          handleUserSelection(value, delivery.id)
                        }
                        options={[
                          { label: "Seleccionar usuario", value: "" },
                          ...users.map((user) => ({
                            label: `${user.names} ${user.lastNames}`,
                            value: user.uid,
                          })),
                        ]}
                      />

                      <Text style={styles.deliveryEditLabel}>Dirección</Text>
                      <CustomPickerModal
                        label="Seleccionar dirección"
                        selectedValue={delivery.address?.placeId}
                        onValueChange={(value) => {
                          const fullAddress =
                            delivery.availableAddresses?.find(
                              (addr: Address) => addr.placeId === value
                            ) || delivery.address;
                          if (fullAddress) {
                            updateDelivery(delivery.id, {
                              address: fullAddress,
                            });
                            console.log(
                              `Dirección seleccionada para la entrega ${
                                idx + 1
                              }:`,
                              fullAddress.description
                            );
                          }
                        }}
                        options={[
                          { label: "Seleccionar dirección", value: "" },
                          ...(delivery.availableAddresses?.map(
                            (addr: Address) => ({
                              label: `${addr?.description}${
                                addr?.additionalInfo
                                  ? ", " + addr.additionalInfo
                                  : ""
                              }`,
                              value: addr?.placeId,
                            })
                          ) || []),
                        ]}
                      />

                      <Text style={styles.deliveryEditLabel}>Producto</Text>
                      <CustomPickerModal
                        label="Seleccionar producto"
                        selectedValue={delivery.productId}
                        onValueChange={(value) =>
                          updateDelivery(delivery.id, { productId: value })
                        }
                        options={[
                          { label: "Seleccionar", value: "" },
                          ...productOptions,
                        ]}
                      />
                      <Text style={styles.deliveryEditLabel}>
                        Cantidad ({delivery.unit})
                      </Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder={`Cantidad (Máx: ${
                          getAvailableQuantity(
                            delivery.productId,
                            delivery.id
                          ) + (delivery.quantity || 0)
                        })`}
                        placeholderTextColor="#999"
                        value={String(delivery.quantity)}
                        onChangeText={(text) => {
                          const newQuantity = Number(text);
                          const currentlyAllocated = editedDeliveries.reduce(
                            (sum, del) => {
                              if (
                                del.productId === delivery.productId &&
                                del.id !== delivery.id
                              ) {
                                return sum + del.quantity;
                              }
                              return sum;
                            },
                            0
                          );
                          const totalOrderedQuantity =
                            selectedOrder.items.find(
                              (item) => item.productId === delivery.productId
                            )?.quantity || 0;

                          if (
                            currentlyAllocated + newQuantity >
                            totalOrderedQuantity
                          ) {
                            showAlert({
                              message: `La cantidad máxima permitida es de ${
                                totalOrderedQuantity - currentlyAllocated
                              }.`,
                              type: "warning",
                            });
                          } else {
                            updateDelivery(delivery.id, {
                              quantity: newQuantity,
                            });
                          }
                        }}
                      />
                      <TouchableOpacity
                        style={styles.removeDeliveryButton}
                        onPress={() => removeDelivery(delivery.id)}
                      >
                        <Text style={styles.removeDeliveryText}>
                          Eliminar Entrega
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.deliveryAddress}>
                        📍 {delivery.address?.description}
                        {delivery.address?.additionalInfo &&
                        delivery.address.additionalInfo.length > 0
                          ? `, ${delivery.address.additionalInfo}`
                          : ""}
                      </Text>
                      {delivery.address?.recipientName && (
                        <Text style={styles.deliveryRecipient}>
                          👤 <Text style={styles.bold}>Entregar a:</Text>{" "}
                          {delivery.address.recipientName}
                        </Text>
                      )}
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
                  )}
                </View>
              )
            )}
            {isEditing && editedDeliveryType === "domicilio" && (
              <View style={styles.addDeliveryButtonsContainer}>
                <TouchableOpacity
                  style={styles.addDeliveryButton}
                  onPress={addDelivery}
                >
                  <Text style={styles.addDeliveryText}>
                    + Entrega existente
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addDeliveryButton}
                  onPress={() => setIsAddingNewAddress(true)}
                >
                  <Text style={styles.addDeliveryText}>+ Nueva dirección</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {selectedOrder.comments && (
          <View style={styles.section}>
            <Text style={styles.label}>Comentarios:</Text>
            <Text style={styles.value}>{selectedOrder.comments}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de la orden</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(selectedOrder.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {translateStatus(selectedOrder.status)}
            </Text>
          </View>
          {selectedOrder.declineReason && (
            <Text style={styles.declineReasonText}>
              Motivo de rechazo: {selectedOrder.declineReason}
            </Text>
          )}
        </View>

        {isEditing ? (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Guardar Cambios</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          (selectedOrder.status === "pending" ||
            selectedOrder.status === "requested") && (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={approveOrder}
              >
                <Text style={styles.buttonText}>Aprobar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.buttonText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          )
        )}

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setModalVisible(false);
            setDeclineReason("");
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Motivo de Rechazo</Text>
              <TextInput
                placeholder="Escribe el motivo..."
                placeholderTextColor="#666"
                style={styles.modalInput}
                multiline
                numberOfLines={4}
                value={declineReason}
                onChangeText={setDeclineReason}
              />
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.rejectButtonModal,
                    { flex: 1, marginRight: 5 },
                  ]}
                  onPress={rejectOrder}
                >
                  <Text style={styles.buttonText}>Rechazar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setDeclineReason("");
                  }}
                  style={[styles.cancelButtonModal, { flex: 1, marginLeft: 5 }]}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isAddingNewAddress}
          transparent
          animationType="fade"
          onRequestClose={() => setIsAddingNewAddress(false)}
        >
          <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: "center" }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView contentContainerStyle={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Nueva Dirección</Text>

                <Text style={styles.label}>Dirección</Text>
                <AddressPicker
                  onPlaceSelected={(place) => {
                    setNewAddressData((prevData) => ({
                      ...prevData,
                      placeId: place.placeId,
                      description: place.description,
                      latitude: place.latitude,
                      longitude: place.longitude,
                    }));
                  }}
                />
                {newAddressData.description !== "" && (
                  <View style={styles.selectedAddressContainer}>
                    <Text style={styles.selectedAddressText}>
                      {newAddressData.description}
                    </Text>
                  </View>
                )}

                <Text style={styles.label}>Información adicional</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Apto 3B, cerca del parque"
                  placeholderTextColor="#999"
                  value={newAddressData.additionalInfo}
                  onChangeText={(text) =>
                    setNewAddressData({
                      ...newAddressData,
                      additionalInfo: text,
                    })
                  }
                />
                <Text style={styles.label}>Nombre de quien recibe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  placeholderTextColor="#999"
                  value={newAddressData.recipientName}
                  onChangeText={(text) =>
                    setNewAddressData({
                      ...newAddressData,
                      recipientName: text,
                    })
                  }
                />

                <Text style={styles.label}>Tipo de documento</Text>
                <CustomPickerModal
                  label="Seleccionar tipo de documento"
                  selectedValue={newAddressData.recipientDocumentType}
                  onValueChange={(value) =>
                    setNewAddressData({
                      ...newAddressData,
                      recipientDocumentType: value,
                    })
                  }
                  options={documentTypeOptions}
                />

                <Text style={styles.label}>Número de documento</Text>
                <TextInput
                  style={styles.input}
                  maxLength={
                    newAddressData.recipientDocumentType === "Cédula" ? 11 : 12
                  }
                  keyboardType={
                    newAddressData.recipientDocumentType === "Cédula"
                      ? "numeric"
                      : "default"
                  }
                  placeholder={
                    newAddressData.recipientDocumentType === "Cédula"
                      ? "Número de Cédula (11 dígitos)"
                      : "Número de Pasaporte (6-12 caracteres)"
                  }
                  placeholderTextColor="#999"
                  value={newAddressData.recipientDocument}
                  onChangeText={(text) => {
                    const validatedText =
                      newAddressData.recipientDocumentType === "Cédula"
                        ? text.replace(/[^0-9]/g, "")
                        : text;
                    setNewAddressData({
                      ...newAddressData,
                      recipientDocument: validatedText,
                    });
                  }}
                />
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.saveButtonModal,
                      { flex: 1, marginRight: 5 },
                    ]}
                    onPress={handleAddNewAddress}
                  >
                    <Text style={styles.buttonText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.cancelButtonModal,
                      { flex: 1, marginLeft: 5 },
                    ]}
                    onPress={() => {
                      setIsAddingNewAddress(false);
                      setNewAddressData({
                        placeId: "",
                        description: "",
                        latitude: 0,
                        longitude: 0,
                        recipientName: "",
                        recipientDocument: "",
                        recipientDocumentType: "Cédula",
                        additionalInfo: "",
                      });
                    }}
                  >
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AdminOrderDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8f3",
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#3e2c1a",
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "#A04A0E",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ede0d4",
  },
  clientInfoSection: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderBottomWidth: 0,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#5a3e1b",
  },
  label: {
    fontSize: 16,
    color: "#777",
    marginTop: 4,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: "#333",
  },
  clientInfoText: {
    fontSize: 16,
    color: "#4a4a4a",
    marginBottom: 6,
  },
  deliveryTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryTypeLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginRight: 8,
  },
  deliveryTypeText: {
    fontSize: 16,
    color: "#333",
    textTransform: "capitalize",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#ede0d4",
    borderRadius: 8,
    padding: 4,
    alignSelf: "flex-start",
  },
  segmentedButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  segmentedButtonActive: {
    backgroundColor: "#A04A0E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentedButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#5a3e1b",
  },
  segmentedButtonTextActive: {
    color: "#fff",
  },
  productCard: {
    backgroundColor: "#fef8f3",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0d3c6",
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#5a3e1b",
    marginBottom: 8,
  },
  productLine: {
    fontSize: 14,
    color: "#4a4a4a",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  deliveriesContainer: {
    marginBottom: 12,
  },
  deliveryCard: {
    backgroundColor: "#fef8f3",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0d3c6",
    marginBottom: 10,
  },
  deliveryAddress: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  deliveryEditLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#5a3e1b",
    marginTop: 8,
    marginBottom: 4,
  },
  deliveryRecipient: {
    fontSize: 14,
    color: "#4a4a4a",
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderColor: "#e0d3c6",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "#333",
  },
  removeDeliveryButton: {
    backgroundColor: "#F44336",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  removeDeliveryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  addDeliveryButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  addDeliveryButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  addDeliveryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  addAddressButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  addAddressText: {
    color: "#fff",
    fontWeight: "bold",
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  declineReasonText: {
    fontSize: 14,
    color: "#D32F2F",
    fontStyle: "italic",
    marginTop: 8,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  approveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rejectButton: {
    backgroundColor: "#F44336",
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: "#A04A0E",
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: "#777",
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#3e2c1a",
  },
  modalInput: {
    height: 100,
    borderColor: "#e0d3c6",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    marginBottom: 16,
    textAlignVertical: "top",
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "#333",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rejectButtonModal: {
    backgroundColor: "#F44336",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonModal: {
    backgroundColor: "#777",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonModal: {
    backgroundColor: "#A04A0E",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  selectedAddressContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 10,
  },
  selectedAddressText: {
    color: "#333",
    fontSize: 14,
  },
  readOnlyInput: {
    height: 44,
    borderColor: "#e0d3c6",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
    fontSize: 16,
    color: "#333",
    paddingTop: 12,
  },
});
