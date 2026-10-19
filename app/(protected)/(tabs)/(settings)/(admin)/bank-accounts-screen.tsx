import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import {
  BankAccount,
  CreateBankAccountPayload,
  createBankAccount,
  deleteBankAccount,
  getBankAccounts,
  updateBankAccount,
} from "@/services/configService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: "Ahorros",
  checking: "Corriente",
  current: "Cuenta Corriente",
};

const ACCOUNT_TYPES: Array<{ label: string; value: CreateBankAccountPayload["accountType"] }> = [
  { label: "Ahorros", value: "savings" },
  { label: "Corriente", value: "checking" },
  { label: "Cuenta Corriente", value: "current" },
];

const emptyForm: CreateBankAccountPayload = {
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  accountType: "savings",
  currency: "DOP",
  routingNumber: "",
  swiftCode: "",
};

const BankAccountsScreen: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateBankAccountPayload>(emptyForm);
  const [typePickerOpen, setTypePickerOpen] = useState(false);

  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  // ─── Carga de datos ──────────────────────────────────────────────────────────
  const fetchAccounts = async () => {
    try {
      show();
      const data = await getBankAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("[BankAccounts] Error al cargar:", error);
      showAlert({ message: "No se pudieron cargar las cuentas bancarias.", type: "error" });
    } finally {
      hide();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAccounts();
    }, [])
  );

  // ─── Modal helpers ────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const handleOpenEdit = (account: BankAccount) => {
    setEditingId(account.id);
    setForm({
      bankName: account.bankName,
      accountHolder: account.accountHolder,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      currency: account.currency,
      routingNumber: account.routingNumber || "",
      swiftCode: account.swiftCode || "",
    });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setForm(emptyForm);
    setTypePickerOpen(false);
  };

  // ─── Guardar ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.bankName.trim() || !form.accountHolder.trim() || !form.accountNumber.trim()) {
      showAlert({
        message: "Banco, titular y número de cuenta son obligatorios.",
        type: "warning",
      });
      return;
    }

    try {
      show();
      if (editingId) {
        const result = await updateBankAccount(editingId, form);
        if (result.success) {
          showAlert({ message: "¡Cuenta bancaria actualizada correctamente!", type: "success" });
          handleCloseModal();
          await fetchAccounts();
        } else {
          showAlert({ message: result.message || "Error al actualizar.", type: "error" });
        }
      } else {
        const result = await createBankAccount(form);
        if (result.success) {
          showAlert({ message: "¡Cuenta bancaria creada correctamente!", type: "success" });
          handleCloseModal();
          await fetchAccounts();
        } else {
          showAlert({ message: result.message || "Error al crear.", type: "error" });
        }
      }
    } catch (error) {
      console.error("[BankAccounts] Error al guardar:", error);
      showAlert({ message: "Ocurrió un error al guardar la cuenta.", type: "error" });
    } finally {
      hide();
    }
  };

  // ─── Eliminar ─────────────────────────────────────────────────────────────────
  const handleDelete = (account: BankAccount) => {
    Alert.alert(
      "Eliminar Cuenta",
      `¿Estás seguro de que deseas eliminar la cuenta de ${account.bankName}?\nEsta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              show();
              const result = await deleteBankAccount(account.id);
              if (result.success) {
                showAlert({ message: "Cuenta bancaria eliminada.", type: "success" });
                await fetchAccounts();
              } else {
                showAlert({ message: result.message || "Error al eliminar.", type: "error" });
              }
            } catch (error) {
              console.error("[BankAccounts] Error al eliminar:", error);
              showAlert({ message: "No se pudo eliminar la cuenta.", type: "error" });
            } finally {
              hide();
            }
          },
        },
      ]
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Cuentas Bancarias</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleOpenCreate}>
            <Ionicons name="add-circle" size={22} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.addButtonText}>Nueva</Text>
          </TouchableOpacity>
        </View>

        {/* Empty state */}
        {accounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={52} color="#CBD5E1" />
            <Text style={styles.emptyText}>No hay cuentas bancarias registradas.</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={handleOpenCreate}>
              <Text style={styles.emptyAddBtnText}>+ Agregar cuenta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          accounts.map((account) => (
            <View key={account.id} style={styles.card}>
              {/* Encabezado de la tarjeta */}
              <View style={styles.cardHeader}>
                <View style={styles.bankIconContainer}>
                  <Ionicons name="business-outline" size={22} color="#0F294A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardBankName}>{account.bankName}</Text>
                  <Text style={styles.cardHolder}>{account.accountHolder}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    account.isActive ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      account.isActive ? styles.statusTextActive : styles.statusTextInactive,
                    ]}
                  >
                    {account.isActive ? "Activa" : "Inactiva"}
                  </Text>
                </View>
              </View>

              {/* Detalles */}
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="card-outline" size={15} color="#64748B" />
                  <Text style={styles.infoLabel}>Número:</Text>
                  <Text style={styles.infoValue}>{account.accountNumber}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="swap-horizontal-outline" size={15} color="#64748B" />
                  <Text style={styles.infoLabel}>Tipo:</Text>
                  <Text style={styles.infoValue}>
                    {ACCOUNT_TYPE_LABELS[account.accountType] ?? account.accountType}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="cash-outline" size={15} color="#64748B" />
                  <Text style={styles.infoLabel}>Moneda:</Text>
                  <Text style={styles.infoValue}>{account.currency}</Text>
                </View>
                {account.swiftCode ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="globe-outline" size={15} color="#64748B" />
                    <Text style={styles.infoLabel}>SWIFT:</Text>
                    <Text style={styles.infoValue}>{account.swiftCode}</Text>
                  </View>
                ) : null}
                {account.routingNumber ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="git-branch-outline" size={15} color="#64748B" />
                    <Text style={styles.infoLabel}>Routing:</Text>
                    <Text style={styles.infoValue}>{account.routingNumber}</Text>
                  </View>
                ) : null}
              </View>

              {/* Acciones */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleOpenEdit(account)}
                >
                  <Ionicons name="create-outline" size={17} color="#0F294A" />
                  <Text style={styles.editBtnText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(account)}
                >
                  <Ionicons name="trash-outline" size={17} color="#E31E24" />
                  <Text style={styles.deleteBtnText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── Modal Crear / Editar ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalCard}>
            {/* Header del modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Editar Cuenta Bancaria" : "Nueva Cuenta Bancaria"}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Banco */}
              <Text style={styles.inputLabel}>Banco *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Banco Popular"
                placeholderTextColor="#999"
                value={form.bankName}
                onChangeText={(t) => setForm((p) => ({ ...p, bankName: t }))}
              />

              {/* Titular */}
              <Text style={styles.inputLabel}>Titular de la cuenta *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del titular"
                placeholderTextColor="#999"
                value={form.accountHolder}
                onChangeText={(t) => setForm((p) => ({ ...p, accountHolder: t }))}
              />

              {/* Número de cuenta */}
              <Text style={styles.inputLabel}>Número de cuenta *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. 000123456789"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={form.accountNumber}
                onChangeText={(t) => setForm((p) => ({ ...p, accountNumber: t }))}
              />

              {/* Tipo de cuenta — selector inline */}
              <Text style={styles.inputLabel}>Tipo de cuenta *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setTypePickerOpen((o) => !o)}
              >
                <Text style={styles.pickerButtonText}>
                  {ACCOUNT_TYPE_LABELS[form.accountType]}
                </Text>
                <Ionicons
                  name={typePickerOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
              {typePickerOpen && (
                <View style={styles.pickerDropdown}>
                  {ACCOUNT_TYPES.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.pickerOption,
                        form.accountType === opt.value && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setForm((p) => ({ ...p, accountType: opt.value }));
                        setTypePickerOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          form.accountType === opt.value && styles.pickerOptionTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {form.accountType === opt.value && (
                        <Ionicons name="checkmark" size={16} color="#E31E24" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Moneda */}
              <Text style={styles.inputLabel}>Moneda</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. DOP, USD"
                placeholderTextColor="#999"
                value={form.currency}
                onChangeText={(t) => setForm((p) => ({ ...p, currency: t }))}
              />

              {/* Routing */}
              <Text style={styles.inputLabel}>Número de enrutamiento (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. 021000021"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={form.routingNumber}
                onChangeText={(t) => setForm((p) => ({ ...p, routingNumber: t }))}
              />

              {/* SWIFT */}
              <Text style={styles.inputLabel}>Código SWIFT / BIC (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. BHDLDO22"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                value={form.swiftCode}
                onChangeText={(t) => setForm((p) => ({ ...p, swiftCode: t }))}
              />

              {/* Botones del modal */}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCloseModal}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>
                    {editingId ? "Guardar Cambios" : "Crear Cuenta"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default BankAccountsScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 80,
    backgroundColor: "#F8FAFC",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F294A",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E31E24",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
  },
  emptyAddBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#0F294A",
    borderRadius: 20,
  },
  emptyAddBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 10,
  },
  bankIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBankName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F294A",
  },
  cardHolder: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "#DCFCE7",
  },
  statusInactive: {
    backgroundColor: "#F1F5F9",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTextActive: {
    color: "#16A34A",
  },
  statusTextInactive: {
    color: "#94A3B8",
  },
  cardBody: {
    padding: 14,
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    minWidth: 70,
  },
  infoValue: {
    fontSize: 13,
    color: "#1E293B",
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#0F294A",
    borderRadius: 8,
    paddingVertical: 9,
    backgroundColor: "#F8FAFC",
  },
  editBtnText: {
    color: "#0F294A",
    fontWeight: "700",
    fontSize: 14,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    paddingVertical: 9,
    backgroundColor: "#FEF2F2",
  },
  deleteBtnText: {
    color: "#E31E24",
    fontWeight: "700",
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    backgroundColor: "#F8FAFC",
    color: "#1E293B",
    marginBottom: 2,
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: "#F8FAFC",
    marginBottom: 2,
  },
  pickerButtonText: {
    fontSize: 15,
    color: "#1E293B",
  },
  pickerDropdown: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 2,
  },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  pickerOptionSelected: {
    backgroundColor: "#FFF1F2",
  },
  pickerOptionText: {
    fontSize: 15,
    color: "#1E293B",
  },
  pickerOptionTextSelected: {
    color: "#E31E24",
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    marginBottom: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  cancelBtnText: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 15,
  },
  saveBtn: {
    flex: 1.5,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#E31E24",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
