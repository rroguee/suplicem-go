import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/components/ScreenHeader";
import { Palette } from "@/constants/theme";
import { SupportConfigPayload } from "@/services/configService";
import { useAdminSupportConfig } from "../hooks/useAdminSupportConfig";

interface FieldDef {
  key: keyof SupportConfigPayload;
  label: string;
  placeholder: string;
  section: "contact" | "schedule";
  inputProps?: Partial<TextInputProps>;
}

const SUPPORT_FIELDS: FieldDef[] = [
  {
    key: "whatsapp",
    label: "WhatsApp (Número con código) *",
    placeholder: "Ej. 18095550199",
    section: "contact",
    inputProps: { keyboardType: "phone-pad" },
  },
  {
    key: "phone",
    label: "Central Telefónica *",
    placeholder: "Ej. (809) 555-0199",
    section: "contact",
    inputProps: { keyboardType: "phone-pad" },
  },
  {
    key: "whatsappMessage",
    label: "Mensaje predeterminado de WhatsApp",
    placeholder: "Texto al abrir WhatsApp",
    section: "contact",
    inputProps: { multiline: true },
  },
  {
    key: "email",
    label: "Correo de Asistencia *",
    placeholder: "Ej. soporte@suplicem.com",
    section: "contact",
    inputProps: { keyboardType: "email-address", autoCapitalize: "none" },
  },
  {
    key: "scheduleWeekday",
    label: "Lunes a Viernes *",
    placeholder: "Ej. 8:00 AM - 6:00 PM",
    section: "schedule",
  },
  {
    key: "scheduleSaturday",
    label: "Sábados *",
    placeholder: "Ej. 8:00 AM - 1:00 PM",
    section: "schedule",
  },
  {
    key: "scheduleSunday",
    label: "Domingos y Feriados *",
    placeholder: "Ej. Guardias de contingencia",
    section: "schedule",
  },
];

export const AdminSupportConfigScreen: React.FC = () => {
  const { form, updateField, handleSave, fetchConfig } = useAdminSupportConfig();

  const renderSection = (title: string, section: "contact" | "schedule") => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {SUPPORT_FIELDS.filter((f) => f.section === section).map((field) => (
        <View key={field.key} style={styles.fieldGroup}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={[styles.input, field.inputProps?.multiline && styles.multilineInput]}
            value={form[field.key]}
            onChangeText={(text) => updateField(field.key, text)}
            placeholder={field.placeholder}
            placeholderTextColor={Palette.placeholder}
            {...field.inputProps}
          />
        </View>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Información de Soporte"
          subtitle="Canales y horarios visibles en el sistema"
          showBack
          onRefresh={fetchConfig}
        />

        {renderSection("Canales de Contacto", "contact")}
        {renderSection("Horarios de Atención", "schedule")}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Ionicons name="save-outline" size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Palette.primaryDark, marginBottom: 8 },
  fieldGroup: { marginTop: 10 },
  label: { fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Palette.primaryDark,
    backgroundColor: "#F8FAFC",
  },
  multilineInput: { minHeight: 72, textAlignVertical: "top" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Palette.primaryDark,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
