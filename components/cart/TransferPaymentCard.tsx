import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BankAccount } from "@/constants/cartConstants";
import { Palette } from "@/constants/theme";
import { ReceiptUploadCard } from "./ReceiptUploadCard";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: "Cuenta de Ahorros",
  checking: "Cuenta Corriente",
  current: "Cuenta Corriente",
  "Cuenta Corriente": "Cuenta Corriente",
  "Cuenta de Ahorros": "Cuenta de Ahorros",
};

const getAccountTypeLabel = (type: string): string =>
  ACCOUNT_TYPE_LABELS[type] ?? type;

const getHolder = (bank: BankAccount): string =>
  bank.accountHolder || bank.holder || "";

const getRnc = (bank: BankAccount): string | null => bank.rnc || null;

interface TransferPaymentCardProps {
  bankAccounts?: BankAccount[];
  selectedBankId: string;
  onSelectBankId: (id: string) => void;
  selectedBank?: BankAccount;
  receiptImage: string | null;
  onPickReceipt: (useCamera: boolean) => void;
  onRemoveReceipt: () => void;
  bankReferenceNumber?: string;
  onChangeBankReferenceNumber?: (ref: string) => void;
}

export const TransferPaymentCard: React.FC<TransferPaymentCardProps> = ({
  bankAccounts = [],
  selectedBankId,
  onSelectBankId,
  selectedBank,
  receiptImage,
  onPickReceipt,
  onRemoveReceipt,
  bankReferenceNumber = "",
  onChangeBankReferenceNumber,
}) => {
  return (
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
            <Text style={{ fontWeight: "bold" }}>{selectedBank.currency}</Text>
          </Text>
          {getHolder(selectedBank) ? (
            <Text style={styles.paymentDetailText}>
              Titular:{" "}
              <Text style={{ fontWeight: "bold" }}>{getHolder(selectedBank)}</Text>
            </Text>
          ) : null}
          {selectedBank.routingNumber ? (
            <Text style={styles.paymentDetailText}>
              No. de Enrutamiento (ABA):{" "}
              <Text style={{ fontWeight: "bold" }}>{selectedBank.routingNumber}</Text>
            </Text>
          ) : null}
          {selectedBank.swiftCode ? (
            <Text style={styles.paymentDetailText}>
              Código SWIFT / BIC:{" "}
              <Text style={{ fontWeight: "bold" }}>{selectedBank.swiftCode}</Text>
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={[styles.bankInfoBox, { alignItems: "center", paddingVertical: 16 }]}>
          <Text style={{ color: Palette.placeholder }}>Cargando cuentas bancarias...</Text>
        </View>
      )}

      <ReceiptUploadCard
        receiptImage={receiptImage}
        onPickReceipt={onPickReceipt}
        onRemoveReceipt={onRemoveReceipt}
        bankReferenceNumber={bankReferenceNumber}
        onChangeBankReferenceNumber={onChangeBankReferenceNumber}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
});
