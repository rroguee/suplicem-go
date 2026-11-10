import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { STANDARD_BAG_QUANTITIES } from "@/constants/cartConstants";
import { formatNumberWithCommas, formatRD, parseNumberWithCommas } from "@/utils/currencyUtils";
import { MobileLotPriceList } from "./MobileLotPriceList";

interface Props {
  basePrice: number;
  manualLotPrices: Record<string, number>;
  onUpdateManualLotPrices: (prices: Record<string, number>) => void;
}

export const MobileLotPricingSection: React.FC<Props> = ({
  basePrice,
  manualLotPrices,
  onUpdateManualLotPrices,
}) => {
  const [selectedLot, setSelectedLot] = useState("50");
  const [inputPrice, setInputPrice] = useState("");

  const selectedLotNum = parseInt(selectedLot, 10) || 50;
  const proportionalPrice = basePrice * selectedLotNum;

  const handleAddPrice = () => {
    const val = parseNumberWithCommas(inputPrice);
    if (!val || val <= 0) return;
    onUpdateManualLotPrices({ ...manualLotPrices, [selectedLot]: Number(val.toFixed(2)) });
    setInputPrice("");
  };

  const handleRemovePrice = (lotKey: string) => {
    const updated = { ...manualLotPrices };
    delete updated[lotKey];
    onUpdateManualLotPrices(updated);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Precios por Lote</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>50 a 1,000</Text></View>
      </View>
      <Text style={styles.helper}>Selecciona el lote en la escala:</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scaleContainer}>
        {STANDARD_BAG_QUANTITIES.map((lot) => {
          const isManual = manualLotPrices[String(lot)] !== undefined;
          const isSelected = selectedLot === String(lot);
          return (
            <TouchableOpacity
              key={lot}
              style={[styles.pill, isManual && styles.pillManual, isSelected && !isManual && styles.pillSelected]}
              onPress={() => {
                setSelectedLot(String(lot));
                setInputPrice(manualLotPrices[String(lot)] ? formatNumberWithCommas(manualLotPrices[String(lot)]) : "");
              }}
            >
              <Text style={[styles.pillText, isManual && styles.pillTextManual, isSelected && !isManual && styles.pillTextSelected]}>
                {lot}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.inputBox}>
        <View style={styles.inputHeader}>
          <View style={styles.lotBadge}><Text style={styles.lotBadgeText}>{selectedLotNum} fundas</Text></View>
          <Text style={styles.propText}>Proporcional: {formatRD(proportionalPrice)}</Text>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputPrice}
            onChangeText={(t) => setInputPrice(formatNumberWithCommas(t))}
            placeholder="Precio del lote (RD$)"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddPrice}>
            <Text style={styles.addBtnText}>Agregar ↵</Text>
          </TouchableOpacity>
        </View>
      </View>

      <MobileLotPriceList
        basePrice={basePrice}
        manualLotPrices={manualLotPrices}
        onRemovePrice={handleRemovePrice}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 13, fontWeight: "bold", textTransform: "uppercase", color: "#64748B" },
  badge: { backgroundColor: "#FFF7ED", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: "#FFEDD5" },
  badgeText: { fontSize: 11, fontWeight: "bold", color: "#EA580C" },
  helper: { fontSize: 12, color: "#94A3B8", marginBottom: 8 },
  scaleContainer: { flexDirection: "row", gap: 6, paddingBottom: 6 },
  pill: { height: 32, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  pillManual: { backgroundColor: "#F97316", borderColor: "#F97316" },
  pillSelected: { borderColor: "#F97316", borderWidth: 2 },
  pillText: { fontSize: 12, fontWeight: "bold", color: "#475569" },
  pillTextManual: { color: "#fff" },
  pillTextSelected: { color: "#EA580C" },
  inputBox: { backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E2E8F0", marginTop: 10 },
  inputHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  lotBadge: { height: 32, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: "#F97316", backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  lotBadgeText: { fontSize: 12, fontWeight: "bold", color: "#0F294A" },
  propText: { fontSize: 12, color: "#64748B" },
  inputRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, height: 42, backgroundColor: "#fff", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, paddingHorizontal: 12, fontSize: 14, fontWeight: "bold", color: "#0F294A" },
  addBtn: { backgroundColor: "#F97316", paddingHorizontal: 14, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
});
