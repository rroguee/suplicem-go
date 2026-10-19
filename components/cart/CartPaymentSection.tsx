import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BANK_ACCOUNTS, BankAccount } from "@/constants/cartConstants";
import { Palette } from "@/constants/theme";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: "Cuenta de Ahorros",
  checking: "Cuenta Corriente",
  current: "Cuenta Corriente",
  // Valores en español que ya venían así (legacy)
  "Cuenta Corriente": "Cuenta Corriente",
  "Cuenta de Ahorros": "Cuenta de Ahorros",
};

const getAccountTypeLabel = (type: string): string =>
  ACCOUNT_TYPE_LABELS[type] ?? type;

const getHolder = (bank: BankAccount): string =>
  bank.accountHolder || bank.holder || "";

const getRnc = (bank: BankAccount): string | null =>
  bank.rnc || null;

type CartPaymentSectionProps = {
  paymentMethod: "transfer" | "credit";
  onPaymentMethodChange: (method: "transfer" | "credit") => void;
  selectedBankId: string;
  onSelectBankId: (id: string) => void;
  selectedBank?: BankAccount;
  bankAccounts?: BankAccount[];
  receiptImage: string | null;
  onPickReceipt: (useCamera: boolean) => void;
  onRemoveReceipt: () => void;
  creditNote: string;
  onChangeCreditNote: (note: string) => void;
};

export const CartPaymentSection: React.FC<CartPaymentSectionProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  selectedBankId,
  onSelectBankId,
  selectedBank,
  bankAccounts = [],
  receiptImage,
  onPickReceipt,
  onRemoveReceipt,
  creditNote,
  onChangeCreditNote,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Opción de Pago</Text>
      <View style={styles.paymentSelectorContainer}>
        <TouchableOpacity
          style={[
            styles.paymentOptionTab,
            paymentMethod === "transfer" && styles.paymentOptionTabActive,
          ]}
          onPress={() => onPaymentMethodChange("transfer")}
        >
          <Ionicons
            name="card-outline"
            size={18}
            color={paymentMethod === "transfer" ? "#fff" : Palette.accent}
          />
          <Text
            style={[
              styles.paymentOptionText,
              paymentMethod === "transfer" && styles.paymentOptionTextActive,
            ]}
            numberOfLines={2}
          >
            Transferencia / Comprobante
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOptionTab,
            paymentMethod === "credit" && styles.paymentOptionTabActive,
          ]}
          onPress={() => onPaymentMethodChange("credit")}
        >
          <Ionicons
            name="hand-left-outline"
            size={18}
            color={paymentMethod === "credit" ? "#fff" : Palette.accent}
          />
          <Text
            style={[
              styles.paymentOptionText,
              paymentMethod === "credit" && styles.paymentOptionTextActive,
            ]}
            numberOfLines={2}
          >
            Pago a Crédito
          </Text>
        </TouchableOpacity>
      </View>

      {paymentMethod === "transfer" ? (
        <View style={styles.paymentDetailCard}>
          <Text style={styles.paymentDetailTitle}>
            Datos para Transferencia Bancaria
          </Text>

          <Text style={styles.bankSelectorLabel}>
            Selecciona el Banco de Destino:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              {bankAccounts.map((bank) => (
                <TouchableOpacity
                  key={bank.id}
                  style={[
                    styles.bankTab,
                    selectedBankId === bank.id && styles.bankTabActive,
                  ]}
                  onPress={() => onSelectBankId(bank.id)}
                >
                  <Text
                    style={[
                      styles.bankTabText,
                      selectedBankId === bank.id && styles.bankTabTextActive,
                    ]}
                  >
                    {bank.bankName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {selectedBank ? (
            <View style={styles.bankInfoBox}>
              <Text style={styles.paymentDetailText}>
                Banco:{" "}
                <Text style={{ fontWeight: "bold", color: Palette.primaryDark }}>
                  {selectedBank.bankName}
                </Text>
              </Text>
              <Text style={styles.paymentDetailText}>
                No. de Cuenta:{" "}
                <Text style={{ fontWeight: "bold", color: Palette.primary }}>
                  {selectedBank.accountNumber}
                </Text>
              </Text>
              <Text style={styles.paymentDetailText}>
                Tipo de Cuenta:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {getAccountTypeLabel(selectedBank.accountType)}
                </Text>
              </Text>
              {getRnc(selectedBank) ? (
                <Text style={styles.paymentDetailText}>
                  RNC:{" "}
                  <Text style={{ fontWeight: "bold" }}>{getRnc(selectedBank)}</Text>
                </Text>
              ) : null}
              <Text style={styles.paymentDetailText}>
                Moneda:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {selectedBank.currency}
                </Text>
              </Text>
              {getHolder(selectedBank) ? (
                <Text style={styles.paymentDetailText}>
                  Titular:{" "}
                  <Text style={{ fontWeight: "bold" }}>{getHolder(selectedBank)}</Text>
                </Text>
              ) : null}
            </View>
          ) : (
            <View style={[styles.bankInfoBox, { alignItems: "center", paddingVertical: 16 }]}>
              <Text style={{ color: Palette.placeholder }}>Cargando cuentas bancarias...</Text>
            </View>
          )}

          <Text style={styles.paymentDetailSubtext}>
            Adjunta una foto o captura de tu comprobante de pago para procesar tu orden.
          </Text>

          {receiptImage ? (
            <View style={styles.receiptPreviewContainer}>
              <Image
                source={{ uri: receiptImage }}
                style={styles.receiptImagePreview}
              />
              <TouchableOpacity
                style={styles.removeReceiptButton}
                onPress={onRemoveReceipt}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.removeReceiptText}>Quitar comprobante</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadOptionsRow}>
              <TouchableOpacity
                style={styles.uploadReceiptButtonHalf}
                onPress={() => onPickReceipt(false)}
              >
                <Ionicons
                  name="images-outline"
                  size={18}
                  color={Palette.accent}
                />
                <Text style={styles.uploadReceiptButtonText}>Galería</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadReceiptButtonHalf}
                onPress={() => onPickReceipt(true)}
              >
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color={Palette.accent}
                />
                <Text style={styles.uploadReceiptButtonText}>Cámara</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.paymentDetailCardCredit}>
          <Text style={styles.paymentDetailTitleCredit}>
            🤝 Solicitud de Pago a Crédito
          </Text>
          <Text style={styles.paymentDetailSubtext}>
            Tu pedido se registrará en tu cuenta corriente según los acuerdos de crédito autorizados.
          </Text>
          <TextInput
            style={styles.creditNoteInput}
            placeholder="Observación (Ej: Pago el próximo viernes o quincena)"
            placeholderTextColor={Palette.placeholder}
            value={creditNote}
            onChangeText={onChangeCreditNote}
          />
        </View>
      )}
    </View>
  );
};

export default CartPaymentSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: Palette.primaryDark,
  },
  paymentSelectorContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    marginBottom: 10,
  },
  paymentOptionTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Palette.accent,
    backgroundColor: Palette.surface,
  },
  paymentOptionTabActive: {
    backgroundColor: Palette.accent,
  },
  paymentOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.accent,
    flexShrink: 1,
  },
  paymentOptionTextActive: {
    color: "#fff",
  },
  paymentDetailCard: {
    backgroundColor: Palette.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 10,
    elevation: 2,
  },
  paymentDetailTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: Palette.primaryDark,
    marginBottom: 10,
  },
  bankSelectorLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.textMuted,
    marginBottom: 6,
  },
  bankTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  bankTabActive: {
    backgroundColor: Palette.primaryDark,
    borderColor: Palette.primaryDark,
  },
  bankTabText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#475569",
  },
  bankTabTextActive: {
    color: "#ffffff",
  },
  bankInfoBox: {
    backgroundColor: Palette.surfaceMuted,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  paymentDetailText: {
    fontSize: 13,
    color: "#334155",
    marginBottom: 4,
  },
  paymentDetailSubtext: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 4,
    marginBottom: 10,
    lineHeight: 16,
  },
  paymentDetailCardCredit: {
    backgroundColor: Palette.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 10,
  },
  paymentDetailTitleCredit: {
    fontWeight: "bold",
    fontSize: 15,
    color: Palette.accent,
    marginBottom: 6,
  },
  creditNoteInput: {
    backgroundColor: "#FAF8F5",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 42,
    fontSize: 13,
    color: Palette.primaryDark,
  },
  uploadOptionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  uploadReceiptButtonHalf: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Palette.accent,
    borderStyle: "dashed",
    backgroundColor: Palette.background,
  },
  uploadReceiptButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: Palette.accent,
  },
  receiptPreviewContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  receiptImagePreview: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeReceiptButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.danger,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeReceiptText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
