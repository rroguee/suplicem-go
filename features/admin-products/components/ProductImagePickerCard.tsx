import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  imageUri: string | null;
  onPickGallery: () => void;
  onTakePhoto: () => void;
}

export const ProductImagePickerCard: React.FC<Props> = ({
  imageUri,
  onPickGallery,
  onTakePhoto,
}) => (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>Fotografía</Text>
    {imageUri && (
      <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
    )}
    <View style={styles.buttonsRow}>
      <TouchableOpacity style={styles.btn} onPress={onPickGallery}>
        <Ionicons name="images-outline" size={18} color="#0F294A" />
        <Text style={styles.btnText}>Galería</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onTakePhoto}>
        <Ionicons name="camera-outline" size={18} color="#0F294A" />
        <Text style={styles.btnText}>Cámara</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", textTransform: "uppercase", color: "#64748B", marginBottom: 10 },
  preview: { width: "100%", height: 160, borderRadius: 12, backgroundColor: "#F1F5F9", marginBottom: 12 },
  buttonsRow: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, height: 44, backgroundColor: "#F1F5F9", borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  btnText: { fontSize: 13, fontWeight: "bold", color: "#0F294A" },
});
