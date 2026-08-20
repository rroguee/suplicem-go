import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

const PrivacyPolicyScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Política de Privacidad</Text>

      <Text style={styles.paragraph}>
        Esta política explica cómo recopilamos, usamos y protegemos tu información personal cuando utilizas nuestra aplicación.
      </Text>

      <Text style={styles.subtitle}>1. Información Recopilada</Text>
      <Text style={styles.paragraph}>
        Podemos recopilar información personal como nombre, correo electrónico y otra información que proporciones al registrarte o usar nuestros servicios.
      </Text>

      <Text style={styles.subtitle}>2. Uso de la Información</Text>
      <Text style={styles.paragraph}>
        Utilizamos tu información para ofrecerte una mejor experiencia, procesar autenticaciones y mejorar nuestros servicios.
      </Text>

      <Text style={styles.subtitle}>3. Protección de Datos</Text>
      <Text style={styles.paragraph}>
        Implementamos medidas de seguridad para proteger tus datos personales contra el acceso no autorizado o divulgación.
      </Text>

      <Text style={styles.subtitle}>4. Compartición de Datos</Text>
      <Text style={styles.paragraph}>
        No compartimos tu información con terceros sin tu consentimiento, salvo que sea requerido por la ley.
      </Text>

      <Text style={styles.subtitle}>5. Cambios en esta Política</Text>
      <Text style={styles.paragraph}>
        Podemos actualizar esta política periódicamente. Se te notificará sobre cambios importantes a través de la aplicación.
      </Text>

      <Text style={styles.subtitle}>6. Contacto</Text>
      <Text style={styles.paragraph}>
        Si tienes preguntas sobre esta política, contáctanos a través de nuestro correo de soporte.
      </Text>
    </ScrollView>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#FAFAFA",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#E31E24",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 6,
    color: "#0F294A",
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
});
