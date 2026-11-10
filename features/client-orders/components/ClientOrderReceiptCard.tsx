import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { pickAndCompressImage } from "@/utils/imageUtils";
import { updateOrderReceipt } from "@/services/orderService";
import { ReceiptViewerModal } from "../../admin-orders/components/ReceiptViewerModal";
import { ActionSuccessModal } from "@/components/common/ActionSuccessModal";

interface ClientOrderReceiptCardProps {
  order: any;
  onReceiptUpdated?: (newReceiptUrl: string) => void;
  canUploadReceipt?: boolean;
}

export const ClientOrderReceiptCard: React.FC<ClientOrderReceiptCardProps> = ({
  order,
  onReceiptUpdated,
  canUploadReceipt = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedUrl, setSavedUrl] = useState("");

  const receiptUrl = order?.receiptImage;

  const handleSelectImageSource = () => {
    Alert.alert(
      "Comprobante de Transferencia",
      "Selecciona de dónde deseas obtener la imagen del comprobante:",
      [
        {
          text: "📷 Tomar Foto",
          onPress: () => processImagePick(true),
        },
        {
          text: "🖼️ Galería de Fotos",
          onPress: () => processImagePick(false),
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  };

  const processImagePick = async (useCamera: boolean) => {
    try {
      const pickResult = await pickAndCompressImage({
        useCamera,
        maxWidth: 1200,
        quality: 0.7,
      });

      if (pickResult.cancelled) return;

      if (!pickResult.success || !pickResult.uri) {
        Alert.alert(
          "Error",
          pickResult.errorMessage || "No se pudo seleccionar la imagen."
        );
        return;
      }

      setLoading(true);
      const res = await updateOrderReceipt(order.id, pickResult.uri);
      setLoading(false);

      if (res?.success) {
        const updatedUrl = res.receiptImage || pickResult.uri;
        setSavedUrl(updatedUrl);
        setShowSuccessModal(true);
      } else {
        Alert.alert("Error", res?.message || "No se pudo actualizar el comprobante.");
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert("Error", err?.message || "Ocurrió un error inesperado al subir la imagen.");
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <Ionicons name="receipt-outline" size={20} color="#0F294A" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Comprobante de Pago</Text>
          <Text style={styles.cardSubtitle}>
            {order?.paymentMethod === "credit"
              ? "Pago a Crédito"
              : receiptUrl
              ? "Comprobante de transferencia adjuntado"
              : "Pendiente de comprobante de transferencia"}
          </Text>
        </View>
      </View>

      {/* Si hay comprobante cargado */}
      {Boolean(receiptUrl) && (
        <View style={styles.previewContainer}>
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: receiptUrl }}
              style={styles.receiptImage}
              resizeMode="cover"
            />
            <View style={styles.zoomOverlay}>
              <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
              <Text style={styles.zoomText}>Ver Imagen</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Botón de acción (Solo para clientes/administradores autorizados) */}
      {canUploadReceipt && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.button, receiptUrl ? styles.buttonOutline : styles.buttonPrimary]}
            onPress={handleSelectImageSource}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={receiptUrl ? "#0F294A" : "#FFFFFF"}
              />
            ) : (
              <>
                <Ionicons
                  name={receiptUrl ? "sync-outline" : "cloud-upload-outline"}
                  size={18}
                  color={receiptUrl ? "#0F294A" : "#FFFFFF"}
                />
                <Text
                  style={[
                    styles.buttonText,
                    receiptUrl ? styles.buttonTextOutline : styles.buttonTextPrimary,
                  ]}
                >
                  {receiptUrl ? "Cambiar comprobante" : "Adjuntar comprobante"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {!canUploadReceipt && !receiptUrl && order?.paymentMethod !== "credit" && (
        <View style={styles.readOnlyNotice}>
          <Ionicons name="information-circle-outline" size={16} color="#64748B" />
          <Text style={styles.readOnlyNoticeText}>
            El cliente aún no ha subido el comprobante de transferencia.
          </Text>
        </View>
      )}

      {/* Viewer Modal */}
      <ReceiptViewerModal
        visible={modalVisible}
        imageUrl={receiptUrl}
        onClose={() => setModalVisible(false)}
      />

      {/* Confirmation Success Modal */}
      <ActionSuccessModal
        visible={showSuccessModal}
        title="¡Comprobante Actualizado!"
        message="El comprobante de pago ha sido subido y actualizado correctamente."
        onClose={() => {
          setShowSuccessModal(false);
          if (onReceiptUpdated && savedUrl) {
            onReceiptUpdated(savedUrl);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F294A",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  previewContainer: {
    marginBottom: 12,
  },
  imageWrapper: {
    height: 140,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  receiptImage: {
    width: "100%",
    height: "100%",
  },
  zoomOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(15, 41, 74, 0.75)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  zoomText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  actionRow: {
    marginTop: 2,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonPrimary: {
    backgroundColor: "#0F294A",
  },
  buttonOutline: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#0F294A",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonTextPrimary: {
    color: "#FFFFFF",
  },
  buttonTextOutline: {
    color: "#0F294A",
  },
  readOnlyNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 4,
  },
  readOnlyNoticeText: {
    fontSize: 12,
    color: "#64748B",
    flex: 1,
  },
});
