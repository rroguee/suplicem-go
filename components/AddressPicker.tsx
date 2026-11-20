import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAddressPicker } from "@/hooks/useAddressPicker";
import { AddressMapModal } from "./AddressMapModal";
import { AddressSuggestionsList } from "./AddressSuggestionsList";

export interface AddressPickerProps {
  initialValue?: string;
  onPlaceSelected: (data: {
    placeId: string;
    description: string;
    latitude: number;
    longitude: number;
  }) => void;
}

export default function AddressPicker({
  onPlaceSelected,
  initialValue = "",
}: AddressPickerProps) {
  const {
    query,
    results,
    loading,
    loadingGps,
    isMapModalVisible,
    setIsMapModalVisible,
    pinLocation,
    pinAddressText,
    loadingPinGeocode,
    handleQueryChange,
    handleSelectSuggestion,
    handleUseCurrentGPS,
    handleOpenMapPinModal,
    updatePinGeocode,
    handleConfirmPinLocation,
    clearQuery,
  } = useAddressPicker({ initialValue, onPlaceSelected });

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputBox}>
        <Ionicons name="location-outline" size={18} color="#E31E24" style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Calle, # casa/apto y sector (ej: Calle Isabel de Torres #7)"
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearQuery} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
        {loading && (
          <ActivityIndicator
            size="small"
            color="#E31E24"
            style={{ marginRight: 4 }}
          />
        )}
      </View>

      {/* Botones de acción rápida: GPS de 1 toque y Marcar en el Mapa */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.gpsButton}
          onPress={handleUseCurrentGPS}
          disabled={loadingGps}
          activeOpacity={0.8}
        >
          {loadingGps ? (
            <ActivityIndicator size="small" color="#0F294A" />
          ) : (
            <Ionicons name="navigate-outline" size={16} color="#0F294A" />
          )}
          <Text style={styles.gpsButtonText}>
            {loadingGps ? "Obteniendo GPS..." : "Usar mi ubicación actual"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mapPinButton}
          onPress={handleOpenMapPinModal}
          activeOpacity={0.8}
        >
          <Ionicons name="map-outline" size={16} color="#E31E24" />
          <Text style={styles.mapPinButtonText}>Marcar en el Mapa</Text>
        </TouchableOpacity>
      </View>

      {/* Badge explicativo de confirmación de dirección activa */}
      {query.trim().length > 0 && (
        <View style={styles.activeBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
          <Text style={styles.activeBadgeText} numberOfLines={1}>
            Dirección activa: {query}
          </Text>
        </View>
      )}

      {/* Lista flotante de sugerencias */}
      <AddressSuggestionsList
        results={results}
        onSelectSuggestion={handleSelectSuggestion}
      />

      {/* Modal interactivo de mapa */}
      <AddressMapModal
        visible={isMapModalVisible}
        onClose={() => setIsMapModalVisible(false)}
        pinLocation={pinLocation}
        pinAddressText={pinAddressText}
        loadingPinGeocode={loadingPinGeocode}
        onRegionChangeComplete={(region) => {
          updatePinGeocode(region.latitude, region.longitude);
        }}
        onConfirm={handleConfirmPinLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    zIndex: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderColor: "#CBD5E1",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  clearBtn: {
    padding: 4,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F294A",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  gpsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  gpsButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F294A",
  },
  mapPinButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  mapPinButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F0FDF4",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  activeBadgeText: {
    fontSize: 12,
    color: "#15803D",
    fontWeight: "600",
    flex: 1,
  },
});
