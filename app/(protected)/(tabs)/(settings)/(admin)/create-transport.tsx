import CustomPickerModal from "@/components/CustomPickerModal";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";

const CreateTransportScreen: React.FC  = () => {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [type, setType] = useState("");

  const handleSubmit = () => {
    if (!brand || !model || !plate || !type) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    const newVehicle = {
      brand,
      model,
      plate,
      type,
    };

    console.log("Vehículo creado:", newVehicle);
    Alert.alert("Éxito", "Vehículo registrado correctamente");

    setBrand("");
    setModel("");
    setPlate("");
    setType("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar Transporte</Text>

      <Text style={styles.label}>Marca</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Toyota"
        value={brand}
        onChangeText={setBrand}
      />

      <Text style={styles.label}>Modelo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Hilux"
        value={model}
        onChangeText={setModel}
      />

      <Text style={styles.label}>Placa</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: A123456"
        value={plate}
        onChangeText={setPlate}
      />

      <CustomPickerModal
        label="Tipo de vehículo"
        selectedValue={type}
        onValueChange={setType}
        options={[
          { label: "Camión", value: "camion" },
          { label: "Pickup", value: "pickup" },
          { label: "Furgoneta", value: "furgoneta" },
        ]}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Guardar vehículo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateTransportScreen;

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
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
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
});
