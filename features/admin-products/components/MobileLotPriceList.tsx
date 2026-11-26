import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatRD } from "@/utils/currencyUtils";

interface Props {
  basePrice: number;
  manualLotPrices: Record<string, number>;
  onRemovePrice: (lotKey: string) => void;
  onSelectLot?: (lotKey: string) => void;
  selectedLot?: string;
}

export const MobileLotPriceList: React.FC<Props> = ({
  basePrice,
  manualLotPrices,
  onRemovePrice,
  onSelectLot,
  selectedLot,
}) => {
  const lots = Object.keys(manualLotPrices).map(Number).sort((a, b) => a - b);
  if (lots.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lotes Fijados ({lots.length})</Text>
      {lots.map((lot) => {
        const lotStr = String(lot);
        const price = manualLotPrices[lotStr];
        const perBag = price / lot;
        const diff = basePrice > 0 ? ((perBag - basePrice) / basePrice) * 100 : 0;
        const isSelected = selectedLot === lotStr;

        return (
          <TouchableOpacity
            key={lot}
            style={[styles.item, isSelected && styles.itemSelected]}
            onPress={() => onSelectLot?.(lotStr)}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>
                {lot} fundas · <Text style={{ color: "#ea580c" }}>{formatRD(price)}</Text>
              </Text>
              <Text style={styles.itemSub}>{formatRD(perBag)} / funda</Text>
            </View>
            <View style={styles.actions}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{diff > 0 ? "+" : ""}{diff.toFixed(1)}%</Text>
              </View>
              <TouchableOpacity
                onPress={() => onRemovePrice(lotStr)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={20} color="#F97316" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  title: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase", color: "#94A3B8", marginBottom: 8 },
  item: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#F8FAFC", marginBottom: 6, borderWidth: 1, borderColor: "#F1F5F9" },
  itemSelected: { borderColor: "#F97316", backgroundColor: "#FFF7ED" },
  itemTitle: { fontSize: 13, fontWeight: "bold", color: "#0F294A" },
  itemSub: { fontSize: 11, color: "#64748B" },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: "#D1FAE5" },
  badgeText: { fontSize: 11, fontWeight: "bold", color: "#059669" },
});
