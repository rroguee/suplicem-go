import React from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { PROVIDER_GOOGLE } from "@/components/MapViewWrapper";

interface AddressMapModalProps {
  visible: boolean;
  onClose: () => void;
  pinLocation: { latitude: number; longitude: number };
  pinAddressText: string;
  loadingPinGeocode: boolean;
  onRegionChangeComplete: (region: { latitude: number; longitude: number }) => void;
  onConfirm: () => void;
}

export const AddressMapModal: React.FC<AddressMapModalProps> = ({
  visible,
  onClose,
  pinLocation,
  pinAddressText,
  loadingPinGeocode,
  onRegionChangeComplete,
  onConfirm,
}) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#0F294A" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.modalTitle}>Marcar Punto de Entrega</Text>
            <Text style={styles.modalSubTitle}>Mueve el mapa para centrar el pin</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.mapWrapper}>
          <MapView
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            style={styles.fullMap}
            initialRegion={{
              latitude: pinLocation.latitude,
              longitude: pinLocation.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            onRegionChangeComplete={(region) => {
              onRegionChangeComplete({
                latitude: region.latitude,
                longitude: region.longitude,
              });
            }}
          />
          <View style={styles.centerPinContainer} pointerEvents="none">
            <Ionicons name="location" size={42} color="#E31E24" />
          </View>
        </View>

        <View style={styles.modalFooter}>
          <View style={styles.pinAddressBox}>
            <Ionicons name="location-sharp" size={18} color="#E31E24" />
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={styles.pinAddressLabel}>Ubicación marcada:</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 20 }}>
                {loadingPinGeocode && <ActivityIndicator size="small" color="#E31E24" />}
                <Text
                  style={[styles.pinAddressValue, loadingPinGeocode && { color: "#64748B" }]}
                  numberOfLines={2}
                >
                  {pinAddressText || "Mueve el mapa para obtener la dirección..."}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.confirmPinButton, loadingPinGeocode && { opacity: 0.6 }]}
            onPress={onConfirm}
            disabled={loadingPinGeocode}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.confirmPinButtonText}>
              {loadingPinGeocode ? "Obteniendo dirección..." : "Confirmar esta ubicación"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddressMapModal;

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#ffffff" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#ffffff",
  },
  modalCloseBtn: { padding: 6 },
  modalTitle: { fontSize: 16, fontWeight: "bold", color: "#0F294A" },
  modalSubTitle: { fontSize: 12, color: "#64748B" },
  mapWrapper: { flex: 1, position: "relative" },
  fullMap: { width: "100%", height: "100%" },
  centerPinContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -42,
  },
  modalFooter: { padding: 16, backgroundColor: "#ffffff", borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  pinAddressBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  pinAddressLabel: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  pinAddressValue: { fontSize: 13, fontWeight: "600", color: "#0F294A" },
  confirmPinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    borderRadius: 10,
  },
  confirmPinButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "bold" },
});
