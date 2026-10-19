import { ORDER_PREFIX } from "@/constants/UserConstants";
import { BankAccount } from "@/constants/cartConstants";
import { Palette } from "@/constants/theme";
import { useAlert } from "@/context/alertContext";
import { AuthContext } from "@/context/authContext";
import { CartContext } from "@/context/cartContext";
import { useLoading } from "@/context/loadingContext";
import { createOrder } from "@/services/orderService";
import { getBankAccounts } from "@/services/configService";
import { updateClientProfile } from "@/services/userService";
import { Address } from "@/types/users";
import { formatRD } from "@/utils/currencyUtils";
import { pickAndCompressImage } from "@/utils/imageUtils";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useContext, useMemo, useState } from "react";
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

import { CartDeliverySection } from "@/components/cart/CartDeliverySection";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { CartPaymentSection } from "@/components/cart/CartPaymentSection";
import {
  DeliveryPreferenceSelector,
  DeliveryPreference,
} from "@/components/cart/DeliveryPreferenceSelector";

const CartScreen: React.FC = () => {
  const {
    cart,
    clearCart,
    removeFromCart,
    updateProductInCart,
    deliveryType,
    updateDeliveryType,
  } = useContext(CartContext);
  const { user, updateUser } = useContext(AuthContext);
  const { show, hide } = useLoading();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [reference, setReference] = useState("");

  // Dirección seleccionada para despacho
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    user?.addresses && user.addresses.length > 0 ? user.addresses[0] : null
  );
  const [customAddressText, setCustomAddressText] = useState("");
  const [customAdditionalInfo, setCustomAdditionalInfo] = useState("");
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);
  const [deliveryPreference, setDeliveryPreference] = useState<DeliveryPreference>("partial");

  // Opciones de pago (Transferencia / Crédito)
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "credit">("transfer");
  const [bankAccountsList, setBankAccountsList] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [creditNote, setCreditNote] = useState<string>("");

  const groupedCart = useMemo(() => {
    return cart.reduce<Record<string, any>>((acc, product) => {
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
  }, [cart]);

  const total = useMemo(() => {
    return Object.values(groupedCart).reduce((sum, item) => {
      const fundas = item.fundas || 1;
      return sum + fundas * item.basePrice * item.quantity;
    }, 0);
  }, [groupedCart]);

  const fetchAccounts = useCallback(async () => {
    try {
      const accounts = await getBankAccounts();
      if (accounts && accounts.length > 0) {
        const mapped: BankAccount[] = accounts.map((b: any) => ({
          ...b,
          bankName: b.bankName || b.bank || "Banco",
          currency: b.currency || "DOP (Pesos Dominicanos)",
          holder: b.holder || b.accountHolder || "SUPLICEM S.R.L.",
        }));
        setBankAccountsList(mapped);
        setSelectedBankId((prevId) => {
          if (prevId && mapped.some((b) => b.id === prevId)) {
            return prevId;
          }
          return mapped[0].id;
        });
      }
    } catch (e) {
      console.log("Error al obtener cuentas bancarias:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setReference("");
      setPaymentMethod("transfer");
      setReceiptImage(null);
      setCreditNote("");
      setSaveAddressToProfile(false);
      fetchAccounts();

      // Preseleccionar dirección registrada por defecto si está disponible y no se ha elegido ninguna
      if (user?.addresses && user.addresses.length > 0) {
        setSelectedAddress((current) => current || user.addresses[0]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchAccounts])
  );

  const selectedBank = bankAccountsList.find((b) => b.id === selectedBankId) || bankAccountsList[0];

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleCustomPlaceSelected = (place: any) => {
    if (place?.description) {
      setCustomAddressText(place.description);
      const newAddr: Address = {
        placeId: place.placeId || `custom-${Date.now()}`,
        description: place.description,
        latitude: place.latitude ?? 0,
        longitude: place.longitude ?? 0,
        additionalInfo: customAdditionalInfo.trim(),
      };
      setSelectedAddress(newAddr);
    }
  };

  const handleCustomAdditionalInfoChange = (text: string) => {
    setCustomAdditionalInfo(text);
    if (selectedAddress) {
      setSelectedAddress({
        ...selectedAddress,
        additionalInfo: text.trim(),
      });
    }
  };

  const handlePickReceipt = async (useCamera = false) => {
    const result = await pickAndCompressImage({
      useCamera,
      maxWidth: 1200,
      quality: 0.7,
      includeBase64: false, 
    });
    if (!result.success) {
      if (result.errorMessage) {
        showAlert({ message: result.errorMessage, type: "warning" });
      }
      return;
    }
    setReceiptImage(result.uri || null);

    showAlert({
      message: "¡Foto del comprobante adjuntada correctamente!",
      type: "success",
    });
  };

  const handleRemoveReceipt = () => {
    setReceiptImage(null);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showAlert({
        message: "Agrega productos antes de confirmar.",
        type: "warning",
      });
      return;
    }

    if (deliveryType === "domicilio") {
      if (!selectedAddress || !selectedAddress.description?.trim()) {
        showAlert({
          message: "Por favor, selecciona o ingresa una dirección de entrega para tu pedido.",
          type: "warning",
        });
        return;
      }

      const lat = Number(selectedAddress.latitude);
      const lng = Number(selectedAddress.longitude);
      if (!lat || !lng || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        showAlert({
          message:
            "La dirección ingresada no tiene coordenadas GPS válidas. Por favor, selecciona una sugerencia de la lista o usa el mapa para fijar tu ubicación.",
          type: "warning",
        });
        return;
      }
    }

    show();

    // Guardar en el perfil si el cliente activó la casilla de verificación
    if (saveAddressToProfile && selectedAddress && user) {
      try {
        const existing = user.addresses || [];
        const isDuplicate = existing.some(
          (a) =>
            a.description.trim().toLowerCase() ===
            selectedAddress.description.trim().toLowerCase()
        );
        if (!isDuplicate) {
          const updatedAddresses = [...existing, selectedAddress];
          await updateClientProfile(user.uid, user.phone, updatedAddresses);
          updateUser({ addresses: updatedAddresses });
        }
      } catch (e) {
        console.warn("No se pudo guardar la dirección en el perfil:", e);
      }
    }

    const formattedDeliveries =
      deliveryType === "domicilio" && selectedAddress
        ? Object.values(groupedCart).map((item) => ({
            productId: item.id,
            address: selectedAddress,
            quantity: Number(item.fundas) || 100,
            unit: "fundas",
          }))
        : [];

    const formattedItems = Object.values(groupedCart).map((item) => ({
      productId: item.id,
      quantity: Number(item.fundas) || 100,
    }));

    const dataToSend: any = {
      deliveryType,
      deliveryPreference: deliveryType === "domicilio" ? deliveryPreference : undefined,
      deliveryAddress: deliveryType === "domicilio" ? selectedAddress : undefined,
      deliveries: formattedDeliveries,
      items: formattedItems,
      paymentMethod,
      bankAccountId: paymentMethod === "transfer" ? selectedBankId : undefined,
      creditNote: paymentMethod === "credit" ? creditNote.trim() : undefined,
      comments: reference.trim(),
    };

    if (receiptImage) {
      dataToSend.receiptImage = receiptImage;
    }

    const idempotencyKey =
      (globalThis as any).crypto?.randomUUID
        ? (globalThis as any).crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    try {
      console.log(`[Checkout] Enviando pedido con Idempotency-Key: ${idempotencyKey}`);
      const response = await createOrder(dataToSend, idempotencyKey);
      hide();

      showAlert({
        message: `Tu pedido fue enviado exitosamente.\n Número de Orden: ${ORDER_PREFIX.ORD}${response.orderNumber}`,
        type: "success",
      });

      clearCart();
      router.back();
    } catch (error: any) {
      console.error("Error enviando pedido:", error);
      hide();

      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo enviar el pedido. Intenta nuevamente.";

      showAlert({
        message: errMsg,
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
          <View style={styles.headerRow}>
            <Text style={styles.title}>Mi Carrito</Text>
            {cart.length > 0 && (
              <TouchableOpacity style={styles.clearAllBtn} onPress={clearCart}>
                <Ionicons name="trash-bin-outline" size={16} color={Palette.danger} />
                <Text style={styles.clearAllBtnText}>Vaciar Carrito</Text>
              </TouchableOpacity>
            )}
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>No hay productos en tu carrito.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {Object.values(groupedCart).map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onUpdateFundas={(fundas) =>
                    updateProductInCart(item.id, { fundas })
                  }
                  onRemove={() => removeFromCart(item.id)}
                />
              ))}
            </View>
          )}

          {cart.length > 0 && (
            <View style={styles.footer}>
              <CartDeliverySection
                deliveryType={deliveryType as "domicilio" | "almacen"}
                onUpdateDeliveryType={updateDeliveryType}
                userAddresses={user?.addresses || []}
                selectedAddress={selectedAddress}
                onSelectAddress={handleSelectAddress}
                customAddressText={customAddressText}
                onChangeCustomAddressText={setCustomAddressText}
                customAdditionalInfo={customAdditionalInfo}
                onChangeCustomAdditionalInfo={handleCustomAdditionalInfoChange}
                onCustomPlaceSelected={handleCustomPlaceSelected}
                saveAddressToProfile={saveAddressToProfile}
                onToggleSaveAddress={setSaveAddressToProfile}
              />

              {deliveryType === "domicilio" && (
                <DeliveryPreferenceSelector
                  preference={deliveryPreference}
                  onSelectPreference={setDeliveryPreference}
                />
              )}

              <CartPaymentSection
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                selectedBankId={selectedBankId}
                onSelectBankId={setSelectedBankId}
                selectedBank={selectedBank}
                bankAccounts={bankAccountsList}
                receiptImage={receiptImage}
                onPickReceipt={handlePickReceipt}
                onRemoveReceipt={handleRemoveReceipt}
                creditNote={creditNote}
                onChangeCreditNote={setCreditNote}
              />

              <Text style={styles.totalText}>
                Total del Pedido: {formatRD(total.toFixed(2))}
              </Text>
              <Text style={styles.label}>Comentarios adicionales</Text>
              <TextInput
                style={styles.input}
                value={reference}
                onChangeText={setReference}
                placeholderTextColor={Palette.placeholder}
                placeholder="Ej. Por favor entregar por la mañana"
              />
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutButtonText}>Realizar pedido</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
    paddingHorizontal: 16,
    paddingTop: 5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 35,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Palette.primaryDark,
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.dangerBg,
    borderWidth: 1,
    borderColor: Palette.dangerBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearAllBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Palette.danger,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: Palette.textMuted,
    textAlign: "center",
  },
  list: {
    paddingBottom: 10,
  },
  footer: {
    marginTop: 10,
    paddingVertical: 14,
    backgroundColor: Palette.background,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: Palette.primaryDark,
  },
  input: {
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    marginTop: 4,
    color: Palette.primaryDark,
  },
  checkoutButton: {
    backgroundColor: Palette.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
    color: Palette.primaryDark,
  },
});
