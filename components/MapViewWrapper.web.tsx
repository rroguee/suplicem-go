import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

export const PROVIDER_GOOGLE = "google";

interface WebMapProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  [key: string]: unknown;
}

const MapView: React.FC<WebMapProps> = ({ style, children }) => (
  <View style={[styles.container, style]}>
    <Text style={styles.message}>El mapa interactivo está disponible en la app móvil.</Text>
    {children}
  </View>
);

export const Marker: React.FC<Record<string, unknown>> = () => null;

export const Polyline: React.FC<Record<string, unknown>> = () => null;

export default MapView;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    padding: 16,
    minHeight: 120,
  },
  message: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
});
