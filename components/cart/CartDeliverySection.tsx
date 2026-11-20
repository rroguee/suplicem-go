import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { Address } from "@/types/users";
import { combineFullAddress } from "@/utils/addressFormatter";
import { DeliveryTypeSelector } from "./DeliveryTypeSelector";
import { SavedAddressesList } from "./SavedAddressesList";
import { NewAddressForm } from "./NewAddressForm";

export type DeliveryItem = {
  address: Address;
  products: { id: string; fundas: number }[];
};

type CartDeliverySectionProps = {
  deliveryType: string;
  onUpdateDeliveryType: (type: "domicilio" | "almacen") => void;
  userAddresses: Address[];
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
  customAddressText: string;
  onChangeCustomAddressText: (text: string) => void;
  customAdditionalInfo: string;
  onChangeCustomAdditionalInfo: (text: string) => void;
  onCustomPlaceSelected: (place: any) => void;
  saveAddressToProfile: boolean;
  onToggleSaveAddress: (save: boolean) => void;
};

export const CartDeliverySection: React.FC<CartDeliverySectionProps> = ({
  deliveryType,
  onUpdateDeliveryType,
  userAddresses,
  selectedAddress,
  onSelectAddress,
  customAddressText,
  onChangeCustomAddressText,
  customAdditionalInfo,
  onChangeCustomAdditionalInfo,
  onCustomPlaceSelected,
  saveAddressToProfile,
  onToggleSaveAddress,
}) => {
  const hasSavedAddresses = userAddresses && userAddresses.length > 0;
  const [activeTab, setActiveTab] = useState<"saved" | "new">(
    hasSavedAddresses ? "saved" : "new"
  );

  return (
    <View style={styles.container}>
      {/* 1. Selector de Tipo de Entrega */}
      <DeliveryTypeSelector
        deliveryType={deliveryType}
        onUpdateDeliveryType={onUpdateDeliveryType}
      />

      {/* 2. Sección de Dirección de Entrega (Solo para domicilio) */}
      {deliveryType === "domicilio" && (
        <View style={styles.addressSection}>
          <Text style={styles.sectionHeading}>Dirección de Entrega</Text>
          <Text style={styles.sectionSub}>
            Selecciona a dónde enviaremos tu material
          </Text>

          {/* Selector de pestañas: Guardadas vs Nueva */}
          {hasSavedAddresses && (
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "saved" && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab("saved")}
              >
                <Ionicons
                  name="home-outline"
                  size={16}
                  color={activeTab === "saved" ? Palette.primary : "#64748B"}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === "saved" && styles.tabButtonTextActive,
                  ]}
                >
                  Guardadas ({userAddresses.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "new" && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab("new")}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={16}
                  color={activeTab === "new" ? Palette.primary : "#64748B"}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === "new" && styles.tabButtonTextActive,
                  ]}
                >
                  Nueva Dirección
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Opción A: Direcciones Guardadas */}
          {activeTab === "saved" && hasSavedAddresses && (
            <SavedAddressesList
              userAddresses={userAddresses}
              selectedAddress={selectedAddress}
              onSelectAddress={onSelectAddress}
            />
          )}

          {/* Opción B: Nueva Dirección */}
          {(activeTab === "new" || !hasSavedAddresses) && (
            <NewAddressForm
              hasSavedAddresses={hasSavedAddresses}
              customAddressText={customAddressText}
              onChangeCustomAddressText={onChangeCustomAddressText}
              customAdditionalInfo={customAdditionalInfo}
              onChangeCustomAdditionalInfo={onChangeCustomAdditionalInfo}
              onCustomPlaceSelected={onCustomPlaceSelected}
              saveAddressToProfile={saveAddressToProfile}
              onToggleSaveAddress={onToggleSaveAddress}
            />
          )}

          {/* 3. Confirmación Visual de Dirección Seleccionada */}
          {selectedAddress && (
            <View style={styles.confirmedBox}>
              <View style={styles.confirmedHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                <Text style={styles.confirmedTitle}>
                  Dirección confirmada para el despacho:
                </Text>
              </View>
              <Text style={styles.confirmedAddressText}>
                📍 {combineFullAddress(selectedAddress.description, selectedAddress.additionalInfo)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default CartDeliverySection;

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: Palette.primaryDark,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: Palette.textMuted,
    marginBottom: 12,
  },
  addressSection: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    padding: 3,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  tabButtonTextActive: {
    color: Palette.primary,
  },
  confirmedBox: {
    marginTop: 14,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 10,
    padding: 12,
  },
  confirmedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  confirmedTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#15803D",
  },
  confirmedAddressText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#166534",
  },
});
