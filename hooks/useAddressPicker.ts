import { useRef, useState } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";
import { cleanFormattedAddress } from "@/utils/addressFormatter";
import {
  reverseGeocodeLocation,
  forwardGeocodeText,
  fetchAddressSuggestions,
  fetchGooglePlaceDetails,
} from "@/services/geocodingService";

interface UseAddressPickerProps {
  initialValue?: string;
  onPlaceSelected: (data: {
    placeId: string;
    description: string;
    latitude: number;
    longitude: number;
  }) => void;
}

const createSessionToken = () => `mob-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
const createPlaceId = (prefix: string) => `${prefix}-${Date.now()}`;

export const useAddressPicker = ({
  initialValue = "",
  onPlaceSelected,
}: UseAddressPickerProps) => {
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
    if (!sessionTokenRef.current) sessionTokenRef.current = createSessionToken();
    return sessionTokenRef.current;
  };

  const fetchNetworkSuggestions = async (text: string, exactOption: any) => {
    setLoading(true);
    const updatedExactOption = { ...exactOption };

    const geocoded = await forwardGeocodeText(text);
    if (geocoded) {
      updatedExactOption.latitude = geocoded.latitude;
      updatedExactOption.longitude = geocoded.longitude;
      onPlaceSelected({
        placeId: createPlaceId("custom-geocoded"),
        description: text,
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
      });
    }

    try {
      const suggestions = await fetchAddressSuggestions(text, getSessionToken());
      const finalResults = [updatedExactOption];
      suggestions.forEach((m) => {
        if (!finalResults.some((r) => r.description.toLowerCase() === m.description.toLowerCase())) {
          finalResults.push(m);
        }
      });
      setResults(finalResults);
    } catch (err) {
      console.log("Error buscando sugerencias de dirección:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    onPlaceSelected({ placeId: createPlaceId("custom"), description: text, latitude: 0, longitude: 0 });

    if (text.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const exactUserOption = { id: "exact-user-input", description: text, isExact: true, latitude: 0, longitude: 0 };
    setResults([exactUserOption]);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchNetworkSuggestions(text, exactUserOption);
    }, 350);
  };

  const handleSelectSuggestion = async (item: any) => {
    setResults([]);
    const finalDescription = cleanFormattedAddress(item.description);
    setQuery(finalDescription);

    if (item.isExact || !item.isGoogle) {
      let lat = item.latitude || 0;
      let lng = item.longitude || 0;

      if (item.isExact && (!lat || !lng)) {
        const geo = await forwardGeocodeText(finalDescription);
        if (geo) {
          lat = geo.latitude;
          lng = geo.longitude;
        }
      }

      onPlaceSelected({ placeId: item.id || createPlaceId("loc"), description: finalDescription, latitude: lat, longitude: lng });
      sessionTokenRef.current = "";
      return;
    }

    try {
      const details = await fetchGooglePlaceDetails(item.placeId, getSessionToken());
      const cleaned = details?.formattedAddress || finalDescription;
      setQuery(cleaned);
      onPlaceSelected({
        placeId: item.placeId,
        description: cleaned,
        latitude: details?.latitude || 0,
        longitude: details?.longitude || 0,
      });
    } catch {
      onPlaceSelected({ placeId: item.placeId, description: finalDescription, latitude: 0, longitude: 0 });
    } finally {
      sessionTokenRef.current = "";
    }
  };

  const handleUseCurrentGPS = async () => {
    setLoadingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Necesitamos permiso de ubicación GPS para obtener tu dirección exacta.");
        setLoadingGps(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = currentLocation.coords.latitude;
      const lng = currentLocation.coords.longitude;
      const addressText = await reverseGeocodeLocation(lat, lng);

      setQuery(addressText);
      setResults([]);
      onPlaceSelected({ placeId: `gps-${Date.now()}`, description: addressText, latitude: lat, longitude: lng });
      setPinLocation({ latitude: lat, longitude: lng });
    } catch {
      Alert.alert("Error de GPS", "No pudimos obtener tu ubicación actual. Intenta de nuevo.");
    } finally {
      setLoadingGps(false);
    }
  };

  const updatePinGeocode = (lat: number, lng: number) => {
    setPinLocation({ latitude: lat, longitude: lng });
    const reqId = ++geocodeReqIdRef.current;
    setLoadingPinGeocode(true);
    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);

    geocodeTimerRef.current = setTimeout(async () => {
      const addr = await reverseGeocodeLocation(lat, lng);
      if (reqId === geocodeReqIdRef.current) {
        setPinAddressText(addr);
        setLoadingPinGeocode(false);
      }
    }, 300);
  };

  const handleOpenMapPinModal = async () => {
    setIsMapModalVisible(true);
    let startLat = pinLocation.latitude;
    let startLng = pinLocation.longitude;

    // 1. Si el usuario ya escribió una dirección en el buscador, geocodificarla primero
    // para centrar el mapa directamente en la ciudad/calle indicada (ej. Mao, Valverde)
    if (query && query.trim().length >= 3) {
      try {
        const geocoded = await forwardGeocodeText(query.trim());
        if (geocoded && geocoded.latitude && geocoded.longitude) {
          startLat = geocoded.latitude;
          startLng = geocoded.longitude;
          setPinLocation({ latitude: startLat, longitude: startLng });
          updatePinGeocode(startLat, startLng);
          return;
        }
      } catch (err) {
        console.log("No se pudo geocodificar la búsqueda para centrar el mapa:", err);
      }
    }

    // 2. Si no hay búsqueda previa o falló la geocodificación, usar el GPS del dispositivo
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        startLat = currentLocation.coords.latitude;
        startLng = currentLocation.coords.longitude;
        setPinLocation({ latitude: startLat, longitude: startLng });
      }
    } catch {}

    updatePinGeocode(startLat, startLng);
  };

  const handleConfirmPinLocation = () => {
    // La descripción debe corresponder fielmente a la ubicación física donde quedó el pin en el mapa
    const finalDesc = pinAddressText && pinAddressText.trim() ? pinAddressText : (query || "Punto marcado en mapa");
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
    onPlaceSelected({ placeId: "", description: "", latitude: 0, longitude: 0 });
  };

  return {
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
  };
};
