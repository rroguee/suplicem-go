import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { styles } from "../styles/adminOrderDetail.styles";

interface AdminOrderActionButtonsProps {
  isEditing: boolean;
  isPendingOrRequested: boolean;
  isSaving: boolean;
  onApprovePress: () => void;
  onRejectPress: () => void;
  onSaveAll: () => void;
  onCancelAll: () => void;
}

export const AdminOrderActionButtons: React.FC<AdminOrderActionButtonsProps> = ({
  isEditing,
  isPendingOrRequested,
  isSaving,
  onApprovePress,
  onRejectPress,
  onSaveAll,
  onCancelAll,
}) => {
  return (
    <>
      {!isEditing && isPendingOrRequested && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.approveButton} onPress={onApprovePress}>
            <Text style={styles.buttonText}>Aprobar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={onRejectPress}>
            <Text style={styles.buttonText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}

      {isEditing && (
        <View style={styles.floatingActionBar}>
          <TouchableOpacity
            style={[styles.saveFloatingBtn, isSaving && { opacity: 0.6 }]}
            onPress={onSaveAll}
            disabled={isSaving}
          >
            <Text style={styles.buttonText}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelFloatingBtn} onPress={onCancelAll}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};
