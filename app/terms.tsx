import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

const TermsScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Términos de Uso</Text>

      <Text style={styles.paragraph}>
        Bienvenido a nuestra aplicación. Al utilizar nuestros servicios, aceptas cumplir con los siguientes términos y condiciones. Por favor, léelos cuidadosamente.
      </Text>

      <Text style={styles.subtitle}>1. Aceptación de los Términos</Text>
      <Text style={styles.paragraph}>
        Al acceder o utilizar esta aplicación, aceptas estar sujeto a estos Términos de Uso. Si no estás de acuerdo con alguna parte, no debes utilizar nuestros servicios.
      </Text>

      <Text style={styles.subtitle}>2. Uso del Servicio</Text>
      <Text style={styles.paragraph}>
        Esta aplicación está destinada solo para uso personal y no comercial. Está prohibido utilizarla para actividades ilegales o no autorizadas.
      </Text>

      <Text style={styles.subtitle}>3. Modificaciones</Text>
      <Text style={styles.paragraph}>
        Nos reservamos el derecho de modificar estos términos en cualquier momento. Se notificará a los usuarios sobre los cambios importantes.
      </Text>

      <Text style={styles.subtitle}>4. Contacto</Text>
      <Text style={styles.paragraph}>
        Si tienes preguntas sobre estos términos, contáctanos a través de nuestro correo de soporte.
      </Text>
    </ScrollView>
  );
};

export default TermsScreen;

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
