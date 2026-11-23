import * as Location from "expo-location";
import { cleanFormattedAddress } from "@/utils/addressFormatter";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const hasValidGoogleKey = () =>
  Boolean(API_KEY && API_KEY !== "your_google_maps_api_key_here" && !API_KEY.includes("your_"));

export const reverseGeocodeLocation = async (lat: number, lng: number): Promise<string> => {
  if (hasValidGoogleKey()) {
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

export const forwardGeocodeText = async (
  text: string
): Promise<{ latitude: number; longitude: number; description: string } | null> => {
  if (!text || text.trim().length < 3) return null;

  if (hasValidGoogleKey()) {
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

export const fetchAddressSuggestions = async (
  text: string,
  sessionToken: string
): Promise<any[]> => {
  if (hasValidGoogleKey()) {
    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        text
      )}&components=country:do&language=es&sessiontoken=${sessionToken}&key=${API_KEY}`;
      const res = await fetch(googleUrl);
      const json = await res.json();
      if (json.status === "OK" && json.predictions && json.predictions.length > 0) {
        return json.predictions.map((p: any) => ({
          id: p.place_id,
          description: cleanFormattedAddress(p.description),
          isGoogle: true,
          placeId: p.place_id,
        }));
      }
    } catch (e) {
      console.log("Error buscando en Google Places Autocomplete:", e);
    }
  }

  try {
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
        return nomJson.map((item: any, idx: number) => ({
          id: `nom-${idx}-${item.place_id}`,
          description: cleanFormattedAddress(item.display_name),
          latitude: parseFloat(item.lat) || 0,
          longitude: parseFloat(item.lon) || 0,
          isGoogle: false,
        }));
      }
    }
  } catch (e) {
    console.log("Error buscando en Nominatim:", e);
  }

  return [];
};

export const fetchGooglePlaceDetails = async (
  placeId: string,
  sessionToken: string
): Promise<{ latitude: number; longitude: number; formattedAddress?: string } | null> => {
  if (!hasValidGoogleKey()) return null;

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
        placeId
      )}&fields=geometry,name,formatted_address,address_components&language=es&sessiontoken=${sessionToken}&key=${API_KEY}`
    );
    const json = await res.json();
    const loc = json.result?.geometry?.location;
    const formattedAddress = json.result?.formatted_address
      ? cleanFormattedAddress(json.result.formatted_address, json.result.address_components)
      : undefined;

    return {
      latitude: loc?.lat || 0,
      longitude: loc?.lng || 0,
      formattedAddress,
    };
  } catch (e) {
    console.log("Error obteniendo detalles del lugar en Google:", e);
    return null;
  }
};
