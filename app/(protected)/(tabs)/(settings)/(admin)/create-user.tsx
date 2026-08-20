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

const CreateUserScreen: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("");
  const [password, setPassword] = useState("");

  const handleCreateUser = () => {
    if (!name || !email || !rol || !password) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, completa todos los campos."
      );
      return;
    }

    console.log("Nuevo usuario:", { name, email, rol, password });
    Alert.alert("Éxito", "Usuario creado correctamente.");

    setName("");
    setEmail("");
    setRol("cliente");
    setPassword("");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Crear Usuario</Text>
      <TextInput
        placeholder="Nombre completo"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <CustomPickerModal
        label="Rol"
        selectedValue={rol}
        onValueChange={setRol}
        options={[
          { label: "Cliente", value: "cliente" },
          { label: "Administrador", value: "admin" },
          { label: "Conductor", value: "conductor" },
        ]}
      />
      <TouchableOpacity style={styles.button} onPress={handleCreateUser}>
        <Text style={styles.buttonText}>Crear Usuario</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateUserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8f3",
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#A04A0E",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
