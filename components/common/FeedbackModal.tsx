import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type FeedbackModalType = "success" | "error" | "confirm" | "warning" | "info";

export interface FeedbackModalProps {
  visible: boolean;
  type?: FeedbackModalType;
  title?: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  type = "info",
  title,
  message,
  onConfirm,
  onCancel,
  onClose,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  confirmButtonColor,
}) => {
  const typeConfig = {
    success: {
      iconName: "checkmark-sharp" as const,
      iconColor: "#16A34A",
      bgCircle: "#DCFCE7",
      defaultTitle: "¡Operación Exitosa!",
      btnColor: "#16A34A",
    },
    error: {
      iconName: "close-sharp" as const,
      iconColor: "#DC2626",
      bgCircle: "#FEE2E2",
      defaultTitle: "Ha ocurrido un error",
      btnColor: "#DC2626",
    },
    confirm: {
      iconName: "alert-outline" as const,
      iconColor: "#D97706",
      bgCircle: "#FEF3C7",
      defaultTitle: "Confirmar acción",
      btnColor: confirmButtonColor || "#E31E24",
    },
    warning: {
      iconName: "warning-outline" as const,
      iconColor: "#D97706",
      bgCircle: "#FEF3C7",
      defaultTitle: "Atención",
      btnColor: "#D97706",
    },
    info: {
      iconName: "information-outline" as const,
      iconColor: "#0284C7",
      bgCircle: "#E0F2FE",
      defaultTitle: "Información",
      btnColor: "#0284C7",
    },
  }[type];

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: typeConfig.bgCircle }]}>
            <Ionicons name={typeConfig.iconName} size={32} color={typeConfig.iconColor} />
          </View>

          <Text style={styles.title}>{title || typeConfig.defaultTitle}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonsContainer}>
            {type === "confirm" ? (
              <>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel} activeOpacity={0.85}>
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { backgroundColor: typeConfig.btnColor }]} onPress={handleConfirm} activeOpacity={0.85}>
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.button, styles.singleButton, { backgroundColor: typeConfig.btnColor }]} onPress={handleConfirm} activeOpacity={0.85}>
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  singleButton: {
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cancelButtonText: {
    color: "#475569",
    fontSize: 15,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default FeedbackModal;
