import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddressPickerProps {
  onPlaceSelected: (data: {
    placeId: string;
    description: string;
    latitude: number;
    longitude: number;
  }) => void;
}

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function AddressPicker({ onPlaceSelected }: AddressPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&types=address&components=country:DO&language=es&key=${API_KEY}`
      );
      const json = await res.json();
      setResults(json.predictions || []);
    } catch (error) {
      console.error("Error buscando direcciones:", error);
    }
    setLoading(false);
  };

  const handleSelect = async (placeId: string, description: string) => {
    setResults([]);
    setQuery(description);

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
          placeId
        )}&fields=geometry,name,formatted_address&language=es&key=${API_KEY}`
      );
      const json = await res.json();
      const loc = json.result.geometry.location;

      onPlaceSelected({
        placeId,
        description,
        latitude: loc.lat,
        longitude: loc.lng,
      });
    } catch (error) {
      console.error("Error obteniendo coordenadas:", error);
    }
  };

  return (
    <View style={{ marginBottom: 10 }}>
      <TextInput
        value={query}
        onChangeText={handleSearch}
        placeholder="Buscar dirección"
        placeholderTextColor="#999"
        style={styles.input}
      />

      {loading && (
        <ActivityIndicator
          size="small"
          color="#E31E24"
          style={{ marginVertical: 4 }}
        />
      )}

      {!loading && results.length > 0 && (
        <ScrollView
          style={styles.resultsContainer}
          keyboardShouldPersistTaps="handled"
        >
          {results.map((item) => (
            <TouchableOpacity
              key={item.place_id}
              onPress={() => handleSelect(item.place_id, item.description)}
              style={styles.resultItem}
            >
              <Text style={{ color: "#000" }}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    color: "#000",
  },
  resultsContainer: {
    maxHeight: 150,
    marginTop: 4,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  resultItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
});
