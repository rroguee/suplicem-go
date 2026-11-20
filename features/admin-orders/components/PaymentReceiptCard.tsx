import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PaymentReceiptCardProps {
  receiptImage?: string;
  comments?: string;
  onViewReceipt: () => void;
}

export const PaymentReceiptCard: React.FC<PaymentReceiptCardProps> = ({
  receiptImage,
  comments,
  onViewReceipt,
}) => {
  if (receiptImage) {
    return (
      <View style={styles.receiptAdminCard}>
        <View style={styles.receiptAdminHeader}>
          <Ionicons name="card-outline" size={22} color="#A04A0E" />
          <Text style={styles.receiptAdminTitle}>Comprobante de Pago Adjunto</Text>
        </View>

        <TouchableOpacity
          style={styles.receiptImageTouchContainer}
          onPress={onViewReceipt}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: receiptImage }}
            style={styles.receiptAdminThumbnail}
            resizeMode="cover"
          />
          <View style={styles.receiptTapOverlay}>
            <Ionicons name="scan-outline" size={22} color="#fff" />
            <Text style={styles.receiptTapText}>Toca para ampliar comprobante</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  if (comments?.includes("Transferencia Bancaria")) {
    return (
      <View style={styles.receiptAdminCardMissing}>
        <Ionicons name="information-circle-outline" size={22} color="#D32F2F" />
        <Text style={styles.receiptAdminMissingText}>
          Pago por Transferencia Bancaria: Comprobante digital no disponible.
        </Text>
      </View>
    );
  }

  return null;
};

export default PaymentReceiptCard;

const styles = StyleSheet.create({
  receiptAdminCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffe0b2",
    padding: 14,
    marginBottom: 16,
  },
  receiptAdminHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  receiptAdminTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#A04A0E",
  },
  receiptImageTouchContainer: {
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
    height: 180,
    backgroundColor: "#000000",
  },
  receiptAdminThumbnail: {
    width: "100%",
    height: "100%",
    opacity: 0.85,
  },
  receiptTapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  receiptTapText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  receiptAdminCardMissing: {
    backgroundColor: "#fffde7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fff59d",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  receiptAdminMissingText: {
    fontSize: 13,
    color: "#5d4037",
    flex: 1,
    lineHeight: 18,
  },
});
