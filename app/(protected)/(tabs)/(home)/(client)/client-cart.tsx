import CustomPickerModal from "@/components/CustomPickerModal";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { useAlert } from "@/context/alertContext";
import { AuthContext } from "@/context/authContext";
import { CartContext } from "@/context/cartContext";
import { useLoading } from "@/context/loadingContext";
import { createOrder } from "@/services/orderService";
import { formatRD } from "@/utils/currencyUtils";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Address } from "@/types/users";

// Ajuste el tipo de deliveries para guardar el objeto Address completo
type Delivery = {
  address: Address;
  products: { id: string; fundas: number }[];
};

const TON_OPTIONS = [
  { fundas: 100, toneladas: 4.25 },
  { fundas: 200, toneladas: 8.5 },
  { fundas: 300, toneladas: 12.75 },
  { fundas: 400, toneladas: 17 },
  { fundas: 500, toneladas: 20.25 },
  { fundas: 600, toneladas: 25.5 },
  { fundas: 1000, toneladas: 42.5 },
];

const DELIVERY_OPTIONS = [
  { label: "Almacén", value: "almacen" },
  { label: "Domicilio", value: "domicilio" },
];

const CartScreen: React.FC = () => {
  const {
    cart,
    clearCart,
    removeFromCart,
    updateProductInCart,
    deliveryType,
    updateDeliveryType,
  } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { show, hide } = useLoading();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  const [currentDelivery, setCurrentDelivery] = useState({
    address: "",
    selectedProduct: "",
    selectedFundas: "",
  });

  const [reference, setReference] = useState("");

  useFocusEffect(
    useCallback(() => {
      setDeliveries([]);
      setCurrentDelivery({
        address: "",
        selectedProduct: "",
        selectedFundas: "",
      });
      setReference("");
    }, [])
  );

  const addressOptions =
    user?.addresses?.map((addr) => ({
      label: `${addr?.description}${addr?.additionalInfo? ", " +addr.additionalInfo : ""}`,
      value: addr?.description,
    })) || [];

  const groupedCart = cart.reduce<Record<string, any>>((acc, product) => {
    const key = product.id;
    if (acc[key]) {
      acc[key].quantity += 1;
    } else {
      acc[key] = {
        ...product,
        basePrice: product.price,
        quantity: 1,
      };
    }
    return acc;
  }, {});

  const total = Object.values(groupedCart).reduce((sum, item) => {
    const fundas = item.fundas || 0;
    return sum + fundas * item.basePrice * item.quantity;
  }, 0);

  const getAssignedFundasForProduct = (productId: string) => {
    let totalFundas = 0;
    deliveries.forEach((d) =>
      d.products.forEach((p) => {
        if (p.id === productId) totalFundas += p.fundas;
      })
    );
    return totalFundas;
  };

  const handleAddDelivery = () => {
    const { address, selectedProduct, selectedFundas } = currentDelivery;
    if (!address || !selectedProduct || !selectedFundas) {
      showAlert({ message: "Completa todos los campos.", type: "warning" });
      return;
    }

    const product = groupedCart[selectedProduct];
    const assigned = getAssignedFundasForProduct(selectedProduct);
    const newTotal = assigned + Number(selectedFundas);

    if (newTotal > (product.fundas || 1000)) {
      showAlert({
        message: `No puedes asignar más fundas de las disponibles: ${
          product.fundas || 1000
        }`,
        type: "error",
      });
      return;
    }

    // Busca el objeto de dirección completo para guardar también la additionalInfo
    const fullAddress = user?.addresses?.find(
      (addr) => addr?.description === address
    );

    if (!fullAddress) {
      showAlert({
        message: "No se encontró la dirección seleccionada.",
        type: "error",
      });
      return;
    }

    setDeliveries([
      ...deliveries,
      {
        address: fullAddress, // <-- Ahora guardamos el objeto de dirección completo
        products: [{ id: selectedProduct, fundas: Number(selectedFundas) }],
      },
    ]);
    setCurrentDelivery({
      address: "",
      selectedProduct: "",
      selectedFundas: "",
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showAlert({
        message: "Agrega productos antes de confirmar.",
        type: "warning",
      });
      return;
    }
    if (deliveryType === "domicilio" && deliveries.length === 0) {
      showAlert({
        message: "Debes asignar al menos una entrega",
        type: "error",
      });
      return;
    }

    show();

    // El objeto `d.address` ahora es el objeto Address completo
    const formattedDeliveries = deliveries.flatMap((d) =>
      d.products.map((p) => ({
        productId: p.id,
        address: d.address, // <-- Usamos el objeto de dirección completo
        quantity: p.fundas,
        unit: "fundas",
      }))
    );

    const formattedItems = Object.values(groupedCart).map((item) => {
      const quantity = item.quantity;
      const unitPrice = item.basePrice;
      const fundas = item.fundas || 0;
      const subtotal = fundas * unitPrice * quantity;
      return {
        productId: item.id,
        name: item.name,
        unit: "fundas",
        quantity: fundas,
        unitPrice,
        subtotal,
      };
    });

    const dataToSend = {
      deliveryType,
      deliveries: formattedDeliveries,
      items: formattedItems,
      comments: reference,
    };

    try {
      const response = await createOrder(dataToSend);
      hide();

      showAlert({
        message: `Tu pedido fue enviado exitosamente.\n Número de Orden:${ORDER_PREFIX.ORD}${response.orderNumber}`,
        type: "success",
      });

      clearCart();
      router.back();
    } catch (error) {
      console.error("Error enviando pedido:", error);
      hide();

      showAlert({
        message: "No se pudo enviar el pedido. Intenta nuevamente.",
        type: "error",
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 250 }}
        >
          <Text style={styles.title}>Mi Carrito</Text>

          {cart.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay productos en el carrito.
            </Text>
          ) : (
            <View style={styles.list}>
              {Object.values(groupedCart).map((item) => (
                <View key={item.id} style={styles.card}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.details}>
                    Precio por funda: {formatRD(item.basePrice)}
                  </Text>
                  <Text style={styles.label}>Toneladas:</Text>
                  <View style={styles.tonContainer}>
                    {TON_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.fundas}
                        onPress={() =>
                          updateProductInCart(item.id, {
                            fundas: option.fundas,
                          })
                        }
                        style={[
                          styles.tonButton,
                          item.fundas === option.fundas &&
                            styles.tonButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tonButtonText,
                            item.fundas === option.fundas && { color: "#fff" },
                          ]}
                        >
                          {option.toneladas} t ({option.fundas} fundas)
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.details}>
                    Subtotal:{" "}
                    {formatRD(
                      (item.fundas || 0) * item.basePrice * item.quantity
                    )}
                  </Text>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                    <Text style={styles.removeText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.footer}>
            <CustomPickerModal
              label="Tipo de entrega"
              selectedValue={deliveryType}
              onValueChange={updateDeliveryType}
              options={DELIVERY_OPTIONS}
            />

            {deliveryType === "domicilio" && (
              <View style={{ marginTop: 20 }}>
                <Text style={styles.label}>Dirección de entrega</Text>
                <CustomPickerModal
                  label="Dirección"
                  selectedValue={currentDelivery.address}
                  onValueChange={(value) =>
                    setCurrentDelivery({ ...currentDelivery, address: value })
                  }
                  options={[
                    { label: "Seleccionar", value: "" },
                    ...addressOptions,
                  ]}
                />

                <Text style={styles.label}>Producto</Text>
                <CustomPickerModal
                  label="Producto"
                  selectedValue={currentDelivery.selectedProduct}
                  onValueChange={(value) =>
                    setCurrentDelivery({
                      ...currentDelivery,
                      selectedProduct: value,
                    })
                  }
                  options={Object.values(groupedCart).map((item) => ({
                    label: `${item.name}`,
                    value: item.id,
                  }))}
                />

                <Text style={styles.label}>Fundas</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. 100"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={currentDelivery.selectedFundas}
                  onChangeText={(text) =>
                    setCurrentDelivery({
                      ...currentDelivery,
                      selectedFundas: text,
                    })
                  }
                />

                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={handleAddDelivery}
                >
                  <Text style={styles.assignButtonText}>Asignar entrega</Text>
                </TouchableOpacity>

                {deliveries.length > 0 && (
                  <View style={styles.deliveriesContainer}>
                    <Text style={styles.deliveriesTitle}>
                      Entregas asignadas
                    </Text>
                    {deliveries.map((delivery, idx) => (
                      <View key={idx} style={styles.deliveryCard}>
                        {/* Se muestra la información adicional aquí */}
                        <Text style={styles.deliveryAddress}>
                          📍 {delivery.address.description}
                          {delivery.address.additionalInfo &&
                            `, ${delivery.address.additionalInfo}`}
                        </Text>
                        {delivery.products.map((product, pidx) => {
                          const prod = groupedCart[product.id];
                          const toneladas = TON_OPTIONS.find(
                            (opt) => opt.fundas === product.fundas
                          )?.toneladas;
                          return (
                            <View key={pidx} style={styles.deliveryProduct}>
                              <Text style={styles.deliveryProductName}>
                                {prod?.name}
                              </Text>
                              <Text style={styles.deliveryProductTon}>
                                Toneladas: {toneladas} ({product.fundas} fundas)
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <Text style={styles.totalText}>
              Total: {formatRD(total.toFixed(2))}
            </Text>
            <Text style={styles.label}>Comentario</Text>
            <TextInput
              style={styles.input}
              value={reference}
              onChangeText={setReference}
              placeholderTextColor="#999"
              placeholder="Ej. Por favor entregar por la mañana"
            />
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>Realizar pedido</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8f3",
    paddingHorizontal: 16,
    paddingTop: 5,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 18, marginTop: 40 },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    color: "#777",
  },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 1,
  },
  name: { fontSize: 16, fontWeight: "bold" },
  details: { marginTop: 4, fontSize: 14, color: "#555" },
  removeText: { color: "red", marginTop: 10 },
  tonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 6,
  },
  tonButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#A04A0E",
    marginRight: 6,
    marginBottom: 6,
  },
  tonButtonActive: { backgroundColor: "#A04A0E" },
  tonButtonText: { fontSize: 13, color: "#A04A0E" },
  footer: { marginTop: 20, paddingVertical: 14, backgroundColor: "#fff8f3" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    marginTop: 4,
  },
  checkoutButton: {
    backgroundColor: "#A04A0E",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  checkoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
  },
  assignButton: {
    backgroundColor: "#A04A0E",
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  assignButtonText: { color: "#fff", fontWeight: "bold" },
  deliveriesContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  deliveriesTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  deliveryCard: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
  },
  deliveryAddress: { fontWeight: "600", marginBottom: 4 },
  deliveryProduct: { marginLeft: 10, marginTop: 2 },
  deliveryProductName: { fontSize: 14 },
  deliveryProductTon: { fontSize: 14, color: "#555" },
});
