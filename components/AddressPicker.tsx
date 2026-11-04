import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "@/components/MapViewWrapper";
import { cleanFormattedAddress } from "@/utils/addressFormatter";

interface AddressPickerProps {
  initialValue?: string;
  onPlaceSelected: (data: {
    placeId: string;
    description: string;
    latitude: number;
    longitude: number;
  }) => void;
}

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const createSessionToken = () =>
  `mob-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const createPlaceId = (prefix: string) => `${prefix}-${Date.now()}`;

export default function AddressPicker({ onPlaceSelected, initialValue = "" }: AddressPickerProps) {
  const [query, setQuery] = useState(initialValue ?? "");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);

  // Modal de Mapa Interactivo
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [pinLocation, setPinLocation] = useState({ latitude: 18.4861, longitude: -69.9312 });
  const [pinAddressText, setPinAddressText] = useState("");
  const [loadingPinGeocode, setLoadingPinGeocode] = useState(false);

  const debounceTimerRef = useRef<any>(null);
  const sessionTokenRef = useRef<string>("");
  const geocodeTimerRef = useRef<any>(null);
  const geocodeReqIdRef = useRef<number>(0);

  const getSessionToken = () => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = createSessionToken();
    }
    return sessionTokenRef.current;
  };

  // Reverse geocoding con Google Geocoding API
  const reverseGeocodeGoogle = async (lat: number, lng: number) => {
    if (API_KEY && !API_KEY.includes("your_")) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=es&key=${API_KEY}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.status === "OK" && json.results && json.results.length > 0) {
          const firstResult = json.results[0];
          return cleanFormattedAddress(firstResult.formatted_address, firstResult.address_components);
        }
      } catch (e) {
        console.log("Error reverse geocoding Google:", e);
      }
    }
    // Fallback a expo-location
    try {
      const [addr] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (addr) {
        const parts = [
          addr.streetNumber ? `No. ${addr.streetNumber}` : "",
          addr.street || addr.name,
          addr.district || addr.subregion || addr.city,
          addr.region && !addr.region.toLowerCase().includes("ozama") ? (addr.region === "Distrito Nacional" ? "Santo Domingo" : addr.region) : "Santo Domingo",
        ].filter(Boolean);
        return cleanFormattedAddress(parts.join(", "));
      }
    } catch (e) {
      console.log("Error reverse geocoding Expo:", e);
    }
    return `Ubicación: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  };

  // Forward geocoding para texto escrito a mano por el usuario
  const forwardGeocodeText = async (text: string) => {
    if (!text || text.trim().length < 3) return null;
    if (API_KEY && !API_KEY.includes("your_")) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          text + ", República Dominicana"
        )}&components=country:do&language=es&key=${API_KEY}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.status === "OK" && json.results && json.results.length > 0) {
          const loc = json.results[0].geometry.location;
          return {
            latitude: loc.lat,
            longitude: loc.lng,
            description: cleanFormattedAddress(json.results[0].formatted_address, json.results[0].address_components),
          };
        }
      } catch (e) {
        console.log("Error forward geocoding:", e);
      }
    }
    return null;
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);

    // Notificar cambio inmediato (sin forzar coordenadas fijas)
    onPlaceSelected({
      placeId: createPlaceId("custom"),
      description: text,
      latitude: 0,
      longitude: 0,
    });

    if (text.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const exactUserOption = {
      id: "exact-user-input",
      description: text,
      isExact: true,
      latitude: 0,
      longitude: 0,
    };

    setResults([exactUserOption]);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchNetworkSuggestions(text, exactUserOption);
    }, 350);
  };

  const fetchNetworkSuggestions = async (text: string, exactOption: any) => {
    setLoading(true);

    let updatedExactOption = { ...exactOption };

    // Intentar geocodificar el texto manual para obtener coordenadas reales
    const geocoded = await forwardGeocodeText(text);
    if (geocoded) {
      updatedExactOption.latitude = geocoded.latitude;
      updatedExactOption.longitude = geocoded.longitude;
      // Notificar con coordenadas reales geocodificadas
      onPlaceSelected({
        placeId: createPlaceId("custom-geocoded"),
        description: text,
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
      });
    }

    try {
      // 1. Google Places Autocomplete API con Session Token y filtro República Dominicana (country:do)
      if (
        API_KEY &&
        API_KEY !== "your_google_maps_api_key_here" &&
        !API_KEY.includes("your_")
      ) {
        const token = getSessionToken();
        const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&components=country:do&language=es&sessiontoken=${token}&key=${API_KEY}`;

        const res = await fetch(googleUrl);
        const json = await res.json();

        if (json.status === "OK" && json.predictions && json.predictions.length > 0) {
          const googleResults = json.predictions.map((p: any) => ({
            id: p.place_id,
            description: cleanFormattedAddress(p.description),
            isGoogle: true,
            placeId: p.place_id,
          }));
          setResults([updatedExactOption, ...googleResults]);
          setLoading(false);
          return;
        }
      }

      // 2. OpenStreetMap Nominatim API Fallback
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        text + ", República Dominicana"
      )}&format=json&addressdetails=1&limit=6`;

      const nomRes = await fetch(nominatimUrl, {
        headers: {
          "User-Agent": "SuplicemApp/1.0 (contact@suplicem.com)",
          "Accept-Language": "es",
        },
      });

      if (nomRes.ok) {
        const nomJson = await nomRes.json();
        if (Array.isArray(nomJson) && nomJson.length > 0) {
          const mapped = nomJson.map((item: any, idx: number) => ({
            id: `nom-${idx}-${item.place_id}`,
            description: cleanFormattedAddress(item.display_name),
            latitude: parseFloat(item.lat) || 0,
            longitude: parseFloat(item.lon) || 0,
            isGoogle: false,
          }));

          const finalResults = [updatedExactOption];
          mapped.forEach((m) => {
            if (!finalResults.some((r) => r.description.toLowerCase() === m.description.toLowerCase())) {
              finalResults.push(m);
            }
          });

          setResults(finalResults);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.log("Error buscando sugerencias de dirección:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = async (item: any) => {
    setResults([]);
    let finalDescription = cleanFormattedAddress(item.description);

    setQuery(finalDescription);

    if (item.isExact || !item.isGoogle) {
      onPlaceSelected({
        placeId: item.id || createPlaceId("loc"),
        description: finalDescription,
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
      });
      sessionTokenRef.current = "";
      return;
    }

    try {
      const token = getSessionToken();
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
          item.placeId
        )}&fields=geometry,name,formatted_address,address_components&language=es&sessiontoken=${token}&key=${API_KEY}`
      );
      const json = await res.json();
      const loc = json.result?.geometry?.location;
      const cleaned = json.result?.formatted_address
        ? cleanFormattedAddress(json.result.formatted_address, json.result.address_components)
        : finalDescription;

      setQuery(cleaned);

      onPlaceSelected({
        placeId: item.placeId,
        description: cleaned,
        latitude: loc?.lat || 0,
        longitude: loc?.lng || 0,
      });
    } catch {
      onPlaceSelected({
        placeId: item.placeId,
        description: finalDescription,
        latitude: 0,
        longitude: 0,
      });
    } finally {
      sessionTokenRef.current = "";
    }
  };

  // Botón 1: "Usar mi ubicación actual" (GPS con 1 toque)
  const handleUseCurrentGPS = async () => {
    setLoadingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso requerido",
          "Necesitamos permiso de ubicación GPS para obtener tu dirección exacta."
        );
        setLoadingGps(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = currentLocation.coords.latitude;
      const lng = currentLocation.coords.longitude;

      const addressText = await reverseGeocodeGoogle(lat, lng);
      setQuery(addressText);
      setResults([]);

      onPlaceSelected({
        placeId: `gps-${Date.now()}`,
        description: addressText,
        latitude: lat,
        longitude: lng,
      });

      setPinLocation({ latitude: lat, longitude: lng });
    } catch {
      Alert.alert("Error de GPS", "No pudimos obtener tu ubicación actual. Intenta de nuevo.");
    } finally {
      setLoadingGps(false);
    }
  };

  // Botón 2: Abrir mapa interactivo para soltar Pin
  const handleOpenMapPinModal = async () => {
    setIsMapModalVisible(true);
    let startLat = pinLocation.latitude;
    let startLng = pinLocation.longitude;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        startLat = currentLocation.coords.latitude;
        startLng = currentLocation.coords.longitude;
        setPinLocation({ latitude: startLat, longitude: startLng });
      }
    } catch {}

    updatePinGeocode(startLat, startLng);
  };

  const updatePinGeocode = (lat: number, lng: number) => {
    const reqId = ++geocodeReqIdRef.current;
    setLoadingPinGeocode(true);
    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);

    geocodeTimerRef.current = setTimeout(async () => {
      const addr = await reverseGeocodeGoogle(lat, lng);
      if (reqId === geocodeReqIdRef.current) {
        setPinAddressText(addr);
        setLoadingPinGeocode(false);
      }
    }, 300);
  };

  const handleConfirmPinLocation = () => {
    const finalDesc = pinAddressText || query || "Punto marcado en mapa";
    setQuery(finalDesc);
    setResults([]);

    onPlaceSelected({
      placeId: `pin-${Date.now()}`,
      description: finalDesc,
      latitude: pinLocation.latitude,
      longitude: pinLocation.longitude,
    });

    setIsMapModalVisible(false);
  };

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    onPlaceSelected({
      placeId: "",
      description: "",
      latitude: 0,
      longitude: 0,
    });
  };

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

      {results.length > 0 && (
        <ScrollView
          style={styles.resultsContainer}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {results.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSelectSuggestion(item)}
              style={[styles.resultItem, item.isExact && styles.resultItemExact]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.isExact ? "checkmark-circle" : "pin-outline"}
                size={16}
                color={item.isExact ? "#16A34A" : "#E31E24"}
                style={styles.itemIcon}
              />
              <Text
                style={[styles.resultText, item.isExact && styles.resultTextExact]}
                numberOfLines={2}
              >
                {item.isExact ? `📌 Guardar esta dirección: "${item.description}"` : item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* MODAL DE MAPA INTERACTIVO (Pin en Mapa) */}
      <Modal
        visible={isMapModalVisible}
        animationType="slide"
        onRequestClose={() => setIsMapModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsMapModalVisible(false)}
            >
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
                setPinLocation({
                  latitude: region.latitude,
                  longitude: region.longitude,
                });
                updatePinGeocode(region.latitude, region.longitude);
              }}
            />

            {/* Centered Fixed Pin */}
            <View style={styles.centerPinContainer} pointerEvents="none">
              <Ionicons name="location" size={42} color="#E31E24" />
            </View>
          </View>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <View style={styles.pinAddressBox}>
              <Ionicons name="location-sharp" size={18} color="#E31E24" />
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text style={styles.pinAddressLabel}>Ubicación marcada:</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 20 }}>
                  {loadingPinGeocode && (
                    <ActivityIndicator size="small" color="#E31E24" />
                  )}
                  <Text
                    style={[
                      styles.pinAddressValue,
                      loadingPinGeocode && { color: "#64748B" },
                    ]}
                    numberOfLines={2}
                  >
                    {pinAddressText || "Mueve el mapa para obtener la dirección..."}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmPinButton}
              onPress={handleConfirmPinLocation}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.confirmPinButtonText}>Confirmar esta ubicación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  resultsContainer: {
    maxHeight: 180,
    marginTop: 4,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderColor: "#CBD5E1",
    borderWidth: 1,
    elevation: 4,
    shadowColor: "#0F294A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomColor: "#F1F5F9",
    borderBottomWidth: 1,
  },
  resultItemExact: {
    backgroundColor: "#F0FDF4",
  },
  itemIcon: {
    marginRight: 8,
  },
  resultText: {
    fontSize: 13,
    color: "#334155",
    flex: 1,
    lineHeight: 18,
  },
  resultTextExact: {
    fontWeight: "bold",
    color: "#15803D",
  },

  // Estilos del Modal del Mapa
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
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
  modalCloseBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  modalSubTitle: {
    fontSize: 12,
    color: "#64748B",
  },
  mapWrapper: {
    flex: 1,
    position: "relative",
  },
  fullMap: {
    width: "100%",
    height: "100%",
  },
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
  modalFooter: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
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
  pinAddressLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  pinAddressValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F294A",
  },
  confirmPinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    borderRadius: 10,
  },
  confirmPinButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
