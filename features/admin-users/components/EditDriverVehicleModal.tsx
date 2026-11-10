import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Palette } from '@/constants/theme';
import { updateDriverProfile } from '@/services/userService';
import { ActionSuccessModal } from '@/components/common/ActionSuccessModal';

interface EditDriverVehicleModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  phone?: string;
  initialVehicle?: {
    plateNumber?: string;
    brand?: string;
    model?: string;
    year?: string;
    tons?: string;
  };
  onSuccess: () => void;
}

export function EditDriverVehicleModal({
  visible,
  onClose,
  userId,
  phone,
  initialVehicle,
  onSuccess,
}: EditDriverVehicleModalProps) {
  const [tons, setTons] = useState(initialVehicle?.tons || '');
  const [plate, setPlate] = useState(initialVehicle?.plateNumber || '');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    if (!tons.trim()) {
      Alert.alert('Error', 'Debes especificar la capacidad en toneladas.');
      return;
    }
    setLoading(true);
    try {
      await updateDriverProfile(
        userId,
        phone || '',
        initialVehicle?.brand || 'N/A',
        initialVehicle?.model || 'N/A',
        initialVehicle?.year || 'N/A',
        tons.trim(),
        plate.trim() || 'N/A'
      );
      setLoading(false);
      setShowSuccess(true);
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', err?.message || 'No se pudo actualizar el vehículo.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Capacidad de Carga del Chofer</Text>
          <Text style={styles.subtitle}>Define cuántas toneladas puede cargar este vehículo para el cálculo de viajes.</Text>

          <Text style={styles.label}>Capacidad (Toneladas):</Text>
          <TextInput
            style={styles.input}
            value={tons}
            onChangeText={setTons}
            keyboardType="numeric"
            placeholder="Ej: 10, 15, 20..."
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Placa del Vehículo (Opcional):</Text>
          <TextInput
            style={styles.input}
            value={plate}
            onChangeText={setPlate}
            placeholder="Ej: ABC-123"
            placeholderTextColor="#888"
          />

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose} disabled={loading}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave} disabled={loading}>
              <Text style={styles.btnSaveText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ActionSuccessModal
        visible={showSuccess}
        title="¡Vehículo Actualizado!"
        message="La capacidad de carga del chofer se ha guardado correctamente."
        onClose={() => {
          setShowSuccess(false);
          onSuccess();
          onClose();
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#fff', width: '100%', borderRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: Palette.textDark, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Palette.textMuted, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Palette.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Palette.border, borderRadius: 8, padding: 10, fontSize: 15, marginBottom: 14 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  btnCancel: { backgroundColor: '#f0f0f0' },
  btnCancelText: { color: '#444', fontWeight: '600' },
  btnSave: { backgroundColor: Palette.primary, minWidth: 90, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontWeight: '600' },
});
