import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ContactButtonsRowProps {
  onCall: () => void;
  onWhatsapp: () => void;
  callLabel?: string;
  whatsappLabel?: string;
}

export const ContactButtonsRow: React.FC<ContactButtonsRowProps> = ({
  onCall,
  onWhatsapp,
  callLabel = "Llamar",
  whatsappLabel = "WhatsApp",
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.callButton}
        onPress={onCall}
        activeOpacity={0.8}
      >
        <Ionicons name="call" size={16} color="#FFFFFF" />
        <Text style={styles.buttonText}>{callLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={onWhatsapp}
        activeOpacity={0.8}
      >
        <Ionicons name="logo-whatsapp" size={17} color="#FFFFFF" />
        <Text style={styles.buttonText}>{whatsappLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactButtonsRow;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginBottom: 6,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#16A34A",
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  whatsappButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#25D366",
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
