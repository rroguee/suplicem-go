import { AuthContext } from "@/context/authContext";
import { useLoading } from "@/context/loadingContext";
import { getCurrentUser, login, recoverPassword } from "@/services/authService";
import { saveAuthSession } from "@/utils/authStorage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { useAlert } from "@/context/alertContext";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen = () => {
  const authContext = useContext(AuthContext);
  const { show, hide } = useLoading();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { showAlert } = useAlert();

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({
        message: "Por favor, complete todos los campos",
        type: "error",
      });
      return;
    }

    show();

    const responseLogin = await login(email, password);

    if (responseLogin?.data?.success) {
      if (!responseLogin?.data?.emailVerified) {
        Alert.alert("¡Hola!", "");
        showAlert({
          message:
            "Aún no has verificado tu cuenta. Por favor, revisa tu correo electrónico y haz clic en el enlace de verificación para activar tu cuenta. Si no lo encuentras, revisa tu carpeta de spam.",
          type: "info",
        });
        hide();
        return;
      }
      const responseUser = await getCurrentUser(responseLogin?.data?.idToken);

      if (responseUser?.data?.success) {
        if (responseUser?.data?.user?.status === "pending") {
          Alert.alert("¡Hola!");
          showAlert({
            message:
              "Hemos recibido tu registro y estamos revisando tu cuenta. Te avisaremos apenas esté todo listo para que puedas acceder. ¡Gracias por tu paciencia!",
            type: "info",
          });
          hide();
          return;
        }

        if (responseUser?.data?.user?.status === "inactive") {
          Alert.alert("¡Hola!", "");
          showAlert({
            message: "Cuenta suspendida temporalmente.",
            type: "info",
          });
          hide();
          return;
        }
        const now = Date.now();
        const newSession = {
          token: responseLogin?.data?.idToken,
          refreshToken: responseLogin?.data?.refreshToken,
          expiresAt: now + parseInt(responseLogin?.data?.expiresIn) * 1000,
        };

        await saveAuthSession(newSession);
        authContext.logIn(responseUser?.data?.user);
      } else {
        Alert.alert("Error", "");
        showAlert({
          message: "Usuario no encontrado",
          type: "error",
        });
      }
    } else {
      showAlert({
        message: responseLogin?.message || "Credenciales inválidas",
        type: "error",
      });
    }

    hide();
  };

  const handlePasswordReset = async () => {
    if (!recoveryEmail) {
      showAlert({
        message: "Ingrese su correo electrónico",
        type: "error",
      });
      return;
    }

    setModalVisible(false);

    show();

    const responseRecovery = await recoverPassword(recoveryEmail);

    if (responseRecovery?.data?.success) {
      Alert.alert("Recuperación");
      showAlert({
        message: `Se enviará un correo a ${recoveryEmail} para restablecer su contraseña.`,
        type: "error",
      });
      setRecoveryEmail("");
    } else {
      showAlert({
        message: "El correo no existe",
        type: "error",
      });
    }

    hide();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require("../assets/images/logo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={24}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Usuario"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={24}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#999"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.linkText}>Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Al acceder demuestras tu conformidad con nuestros{" "}
            <Text
              style={styles.linkInline}
              onPress={() => router.push("/terms")}
            >
              Términos de Uso
            </Text>{" "}
            y{" "}
            <Text
              style={styles.linkInline}
              onPress={() => router.push("/privacy")}
            >
              Política de Privacidad
            </Text>
            .
          </Text>
        </View>

        {/* Modal de recuperación */}
        <Modal
          transparent
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Recuperar contraseña</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Correo electrónico"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={recoveryEmail}
                onChangeText={setRecoveryEmail}
              />

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handlePasswordReset}
              >
                <Text style={styles.modalButtonText}>Enviar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 150,
    backgroundColor: "#ffffff",
  },
  logo: {
    width: 250,
    height: 250,
    alignSelf: "center",
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fdfdfd",
  },
  button: {
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#0F294A",
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  linkButton: {
    marginTop: 14,
    alignItems: "center",
  },
  linkText: {
    color: "#E31E24",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  modalInput: {
    height: 44,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: "#f9f9f9",
  },
  modalButton: {
    backgroundColor: "#E31E24",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  modalCancelText: {
    color: "#0F294A",
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fdfdfd",
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  eyeIcon: {
    marginLeft: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  termsContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  termsText: {
    textAlign: "center",
    fontSize: 13,
    color: "#555",
  },
  linkInline: {
    color: "#E31E24",
    textDecorationLine: "underline",
  },
});
