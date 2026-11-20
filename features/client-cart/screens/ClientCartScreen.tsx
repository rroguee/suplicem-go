import React from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { formatRD } from "@/utils/currencyUtils";
import { CartDeliverySection } from "@/components/cart/CartDeliverySection";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { CartPaymentSection } from "@/components/cart/CartPaymentSection";
import { useClientCart } from "../hooks/useClientCart";

export const ClientCartScreen: React.FC = () => {
  const {
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
  } = useClientCart();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          {assistedClient && (
            <View style={styles.assistedBanner}>
              <View style={styles.assistedTextCol}>
                <Text style={styles.assistedBannerTitle}>Venta Asistida en Curso</Text>
                <Text style={styles.assistedBannerClient}>
                  Cliente: {assistedClient.names} {assistedClient.lastNames || ""}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setAssistedClient(null)}
                style={styles.assistedCancelBtn}
              >
                <Text style={styles.assistedCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}

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
                userAddresses={targetUser?.addresses || []}
                selectedAddress={selectedAddress}
                onSelectAddress={handleSelectAddress}
                customAddressText={customAddressText}
                onChangeCustomAddressText={setCustomAddressText}
                customAdditionalInfo={customAdditionalInfo}
                onChangeCustomAdditionalInfo={handleCustomAdditionalInfoChange}
                onCustomPlaceSelected={handleCustomPlaceSelected}
                saveAddressToProfile={saveAddressToProfile}
                onToggleSaveAddress={setSaveAddressToProfile}
                addressTab={addressTab}
                onAddressTabChange={setAddressTab}
              />

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
                hasAssignedSeller={hasAssignedSeller}
                bankReferenceNumber={bankReferenceNumber}
                onChangeBankReferenceNumber={setBankReferenceNumber}
              />

              <Text style={styles.totalText}>
                Total Estimado:{" "}
                <Text style={styles.totalValue}>{formatRD(total)}</Text>
              </Text>

              <View style={styles.commentsContainer}>
                <Text style={styles.commentsLabel}>
                  Comentarios o instrucciones para el pedido:
                </Text>
                <TextInput
                  style={styles.referenceInput}
                  placeholder="Ej: Entregar en la puerta trasera, llamar antes de llegar..."
                  placeholderTextColor="#999"
                  value={reference}
                  onChangeText={setReference}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
                activeOpacity={0.88}
              >
                <Text style={styles.checkoutText}>Confirmar y Enviar Pedido</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ClientCartScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#FAFAFA",
  },
  contentContainer: {
    paddingBottom: 250,
  },
  assistedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#3B82F6",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  assistedTextCol: {
    flex: 1,
  },
  assistedBannerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1D4ED8",
  },
  assistedBannerClient: {
    fontSize: 13,
    color: "#2563EB",
    marginTop: 2,
  },
  assistedCancelBtn: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  assistedCancelBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1E40AF",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F294A",
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  clearAllBtnText: {
    color: Palette.danger,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  list: {
    gap: 12,
  },
  footer: {
    marginTop: 20,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    textAlign: "right",
    marginVertical: 14,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F294A",
  },
  commentsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  commentsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  referenceInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#1E293B",
    textAlignVertical: "top",
    minHeight: 60,
  },
  checkoutButton: {
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  checkoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
