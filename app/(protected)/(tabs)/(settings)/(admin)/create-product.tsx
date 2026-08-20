import CustomPickerModal from "@/components/CustomPickerModal";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLoading } from "@/context/loadingContext";
import { createProduct } from "@/services/productService";

const CreateProductScreen: React.FC = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { show, hide } = useLoading();
  const router = useRouter();

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se requiere acceso a la galería.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se requiere acceso a la cámara.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !type) {
      Alert.alert(
        "Error",
        "Completa todos los campos antes de guardar el producto."
      );
      return;
    }

    const newProduct = {
      name,
      price: parseFloat(price),
      unit: type,
      imageUrl: "https://enfoco.com.do/test/suplicem/cemento.jpg",
    };

    try {
      show();
      await createProduct(newProduct);
      hide();

      Alert.alert("Éxito", "Producto creado correctamente.");
      router.back();
    } catch (error) {
      console.error("❌ Error al crear producto:", error);
      hide();
      Alert.alert("Error", "Hubo un problema al crear el producto.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear Producto</Text>

      <Text style={styles.label}>Nombre del producto</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej: Funda de Cemento"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Precio</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Ej: 510"
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

      <CustomPickerModal
        label="Tipo de producto"
        selectedValue={type}
        onValueChange={setType}
        options={[
          { label: "Cemento", value: "cemento" },
          { label: "Varilla", value: "varilla" },
          { label: "Arena", value: "arena" },
        ]}
      />

      <Text style={styles.label}>Imagen del producto</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      )}

      <View style={styles.imageButtons}>
        <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
          <Text style={styles.imageButtonText}>Galería</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto}>
          <Text style={styles.imageButtonText}>Cámara</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Guardar producto</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateProductScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff8f3",
    flexGrow: 1,
    paddingBottom: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: "#333",
    fontWeight: "bold",
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
  },
  imageButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#ddd",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  imageButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#A04A0E",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#F44336",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
