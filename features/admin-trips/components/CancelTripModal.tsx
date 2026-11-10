import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

interface CancelTripModalProps {
  visible: boolean;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CancelTripModal: React.FC<CancelTripModalProps> = ({
  visible,
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
  isSubmitting = false,
}) => {
  const trimmedLength = reason.trim().length;
  const isReasonInvalid = trimmedLength > 0 && trimmedLength < 5;
  const isConfirmDisabled = trimmedLength < 5 || isSubmitting;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Cancelar Viaje</Text>
          <Text style={styles.modalSubtitle}>
            Debes ingresar un motivo o justificación (mínimo 5 caracteres) para cancelar este viaje. Las órdenes asociadas serán liberadas.
          </Text>

          <TextInput
            style={styles.modalInput}
            placeholder="Escribe el motivo de la cancelación..."
            placeholderTextColor="#9CA3AF"
            value={reason}
            onChangeText={onReasonChange}
            multiline
            numberOfLines={4}
            editable={!isSubmitting}
          />

          {isReasonInvalid && (
            <Text style={styles.errorText}>
              El motivo debe tener al menos 5 caracteres ({trimmedLength}/5).
            </Text>
          )}

          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Volver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                isConfirmDisabled && styles.disabledButton,
              ]}
              onPress={onConfirm}
              disabled={isConfirmDisabled}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirmar Cancelación</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CancelTripModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 14,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 18,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
    color: "#111827",
    minHeight: 90,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 12,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  confirmButton: {
    flex: 1.5,
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
