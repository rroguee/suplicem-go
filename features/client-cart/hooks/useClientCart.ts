import { useCallback, useContext, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { BankAccount } from "@/constants/cartConstants";
import { useAlert } from "@/context/alertContext";
import { AuthContext } from "@/context/authContext";
import { CartContext } from "@/context/cartContext";
import { useLoading } from "@/context/loadingContext";
import { createOrder } from "@/services/orderService";
import { getBankAccounts } from "@/services/configService";
import { updateClientProfile } from "@/services/userService";
import { Address } from "@/types/users";
import { pickAndCompressImage } from "@/utils/imageUtils";

export const useClientCart = () => {
  const {
    cart,
    clearCart,
    removeFromCart,
    updateProductInCart,
    deliveryType,
    updateDeliveryType,
    assistedClient,
    setAssistedClient,
  } = useContext(CartContext);
  const { user, updateUser } = useContext(AuthContext);
  const { show, hide } = useLoading();
  const router = useRouter();
  const { showAlert } = useAlert();

  const targetUser = assistedClient || user;
  const hasAssignedSeller = Boolean(assistedClient ? assistedClient.sellerId : user?.sellerId);

  const [reference, setReference] = useState("");
  const hasSaved = Boolean(targetUser?.addresses && targetUser.addresses.length > 0);
  const [addressTab, setAddressTab] = useState<"saved" | "new">(hasSaved ? "saved" : "new");
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<Address | null>(
    hasSaved ? targetUser!.addresses![0] : null
  );
  const [customAddress, setCustomAddress] = useState<Address | null>(null);
  const [customAddressText, setCustomAddressText] = useState("");
  const [customAdditionalInfo, setCustomAdditionalInfo] = useState("");
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);

  // Dirección efectiva según la pestaña activa
  const selectedAddress = addressTab === "saved" ? selectedSavedAddress : customAddress;

  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "credit">("transfer");
  const [bankAccountsList, setBankAccountsList] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [bankReferenceNumber, setBankReferenceNumber] = useState("");
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
          accountType: b.accountType || "savings",
          currency: b.currency || "DOP (Pesos Dominicanos)",
          accountHolder: b.accountHolder || b.holder || "",
          holder: b.holder || b.accountHolder || "",
          rnc: b.rnc || "",
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

      if (targetUser?.addresses && targetUser.addresses.length > 0) {
        setSelectedSavedAddress((current) => current || targetUser.addresses![0]);
      }
    }, [fetchAccounts])
  );

  const selectedBank = bankAccountsList.find((b) => b.id === selectedBankId) || bankAccountsList[0];

  const handleSelectAddress = (address: Address) => {
    setSelectedSavedAddress(address);
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
      setCustomAddress(newAddr);
    }
  };

  const handleCustomAdditionalInfoChange = (text: string) => {
    setCustomAdditionalInfo(text);
    if (customAddress) {
      setCustomAddress({
        ...customAddress,
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

    if (paymentMethod === "credit" && !hasAssignedSeller) {
      showAlert({
        message: "El pago a crédito está restringido: se requiere un vendedor asignado a la cartera.",
        type: "warning",
      });
      return;
    }

    if (paymentMethod === "transfer" && !bankReferenceNumber.trim()) {
      showAlert({
        message: "Por favor, ingresa el número de referencia del depósito o transferencia bancaria.",
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
            quantity: Number(item.fundas) || 50,
            unit: item.unit || "fundas",
          }))
        : [];

    const formattedItems = Object.values(groupedCart).map((item) => ({
      productId: item.id,
      quantity: Number(item.fundas) || 50,
      name: item.name,
      unit: item.unit || "fundas",
    }));

    const isSeller = user?.userType === "seller";
    const dataToSend: any = {
      userId: assistedClient ? assistedClient.uid : undefined,
      createdBySellerId: assistedClient && isSeller ? user?.uid : undefined,
      createdByAdminId: assistedClient && !isSeller ? user?.uid : undefined,
      deliveryType,
      deliveryAddress: deliveryType === "domicilio" ? selectedAddress : undefined,
      deliveries: formattedDeliveries,
      items: formattedItems,
      paymentMethod,
      bankAccountId: paymentMethod === "transfer" ? selectedBankId : undefined,
      bankReferenceNumber: paymentMethod === "transfer" ? bankReferenceNumber.trim() : undefined,
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

      if (!response || response.success === false || !response.orderNumber) {
        showAlert({
          message: response?.message || "No se pudo procesar el pedido. Intenta nuevamente.",
          type: "error",
        });
        return;
      }

      showAlert({
        message: `Tu pedido fue enviado exitosamente.\n Número de Orden: ${ORDER_PREFIX.ORD}${response.orderNumber}`,
        type: "success",
      });

      clearCart();
      if (assistedClient) {
        setAssistedClient(null);
      }
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

  return {
    cart,
    clearCart,
    removeFromCart,
    updateProductInCart,
    deliveryType,
    updateDeliveryType,
    assistedClient,
    setAssistedClient,
    targetUser,
    hasAssignedSeller,
    reference,
    setReference,
    selectedAddress,
    addressTab,
    setAddressTab,
    customAddressText,
    setCustomAddressText,
    customAdditionalInfo,
    saveAddressToProfile,
    setSaveAddressToProfile,
    paymentMethod,
    setPaymentMethod,
    bankAccountsList,
    selectedBankId,
    setSelectedBankId,
    selectedBank,
    bankReferenceNumber,
    setBankReferenceNumber,
    receiptImage,
    creditNote,
    setCreditNote,
    groupedCart,
    total,
    handleSelectAddress,
    handleCustomPlaceSelected,
    handleCustomAdditionalInfoChange,
    handlePickReceipt,
    handleRemoveReceipt,
    handleCheckout,
  };
};
