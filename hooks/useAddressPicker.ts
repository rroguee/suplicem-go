import { useRef, useState } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";
import { cleanFormattedAddress } from "@/utils/addressFormatter";

interface UseAddressPickerProps {
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
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = createSessionToken();
    }
    return sessionTokenRef.current;
  };

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
    try {
      const [addr] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (addr) {
        const parts = [
          addr.streetNumber ? `No. ${addr.streetNumber}` : "",
          addr.street || addr.name,
          addr.district || addr.subregion || addr.city,
          addr.region && !addr.region.toLowerCase().includes("ozama")
            ? addr.region === "Distrito Nacional"
              ? "Santo Domingo"
              : addr.region
            : "Santo Domingo",
        ].filter(Boolean);
        return cleanFormattedAddress(parts.join(", "));
      }
    } catch (e) {
      console.log("Error reverse geocoding Expo:", e);
    }
    return `Ubicación: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  };

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
            description: cleanFormattedAddress(
              json.results[0].formatted_address,
              json.results[0].address_components
            ),
          };
        }
      } catch (e) {
        console.log("Error forward geocoding Google:", e);
      }
    }

    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        text + ", República Dominicana"
      )}&format=json&addressdetails=1&limit=1`;
      const nomRes = await fetch(nominatimUrl, {
        headers: {
          "User-Agent": "SuplicemApp/1.0 (contact@suplicem.com)",
          "Accept-Language": "es",
        },
      });
      if (nomRes.ok) {
        const nomJson = await nomRes.json();
        if (Array.isArray(nomJson) && nomJson.length > 0) {
          const first = nomJson[0];
          return {
            latitude: parseFloat(first.lat) || 0,
            longitude: parseFloat(first.lon) || 0,
            description: cleanFormattedAddress(first.display_name),
          };
        }
      }
    } catch (e) {
      console.log("Error forward geocoding Nominatim:", e);
    }

    return null;
  };

  const fetchNetworkSuggestions = async (text: string, exactOption: any) => {
    setLoading(true);
    let updatedExactOption = { ...exactOption };

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
      if (API_KEY && API_KEY !== "your_google_maps_api_key_here" && !API_KEY.includes("your_")) {
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

  const handleQueryChange = (text: string) => {
    setQuery(text);
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

      onPlaceSelected({
        placeId: item.id || createPlaceId("loc"),
        description: finalDescription,
        latitude: lat,
        longitude: lng,
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
