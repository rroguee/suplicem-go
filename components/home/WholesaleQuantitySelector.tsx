import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Palette } from "@/constants/theme";

type WholesaleQuantitySelectorProps = {
  quantity: number;
  onChangeQuantity: (qty: number) => void;
  tonsPerBag: number;
  unit?: string;
};

export const WholesaleQuantitySelector: React.FC<WholesaleQuantitySelectorProps> = ({
  quantity,
  onChangeQuantity,
  tonsPerBag,
  unit = "fundas",
}) => {
  const [textVal, setTextVal] = useState(quantity > 0 ? String(quantity) : "");

  useEffect(() => {
    if (quantity > 0 && String(quantity) !== textVal && textVal !== "") {
      setTextVal(String(quantity));
    }
  }, [quantity]);

  const numVal = parseInt(textVal, 10) || 0;
  const isMultipleOf50 = numVal >= 50 && numVal % 50 === 0;
  const calculatedTons = (numVal * tonsPerBag).toFixed(2);

  const handleAdjust = (delta: number) => {
    const next = Math.max(50, numVal + delta);
    setTextVal(String(next));
    onChangeQuantity(next);
  };

  const handleTextChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "");
    setTextVal(clean);
    const val = parseInt(clean, 10);
    onChangeQuantity(isNaN(val) ? 0 : val);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerLabel}>Cantidad Mayorista Personalizada:</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, !isMultipleOf50 && numVal > 0 && styles.inputError]}
          keyboardType="numeric"
          value={textVal}
          placeholder="Ej. 1500"
          placeholderTextColor="#94A3B8"
          onChangeText={handleTextChange}
        />
        <Text style={styles.unitBadge}>{unit}</Text>
      </View>

      <View style={styles.tonsRow}>
        <Text style={styles.tonsText}>
          Equivalente a: <Text style={styles.tonsValue}>{calculatedTons} t</Text>
        </Text>
      </View>

      {!isMultipleOf50 && numVal > 0 && (
        <Text style={styles.validationError}>
          * La cantidad debe ser múltiplo de 50 {unit}.
        </Text>
      )}

      <View style={styles.stepperContainer}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => handleAdjust(-500)}
          disabled={numVal <= 50}
        >
          <Text style={styles.stepBtnText}>-500</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => handleAdjust(-50)}
          disabled={numVal <= 50}
        >
          <Text style={styles.stepBtnText}>-50</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => handleAdjust(50)}
        >
          <Text style={styles.stepBtnText}>+50</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => handleAdjust(500)}
        >
          <Text style={styles.stepBtnText}>+500</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WholesaleQuantitySelector;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.primaryDark,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    fontSize: 18,
    fontWeight: "700",
    color: Palette.primaryDark,
    textAlign: "center",
  },
  inputError: {
    borderColor: Palette.danger,
  },
  unitBadge: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  tonsRow: {
    alignItems: "center",
    marginTop: 8,
  },
  tonsText: {
    fontSize: 13,
    color: "#475569",
  },
  tonsValue: {
    fontWeight: "700",
    color: Palette.primary,
  },
  validationError: {
    fontSize: 12,
    color: Palette.danger,
    textAlign: "center",
    marginTop: 6,
  },
  stepperContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    marginTop: 12,
  },
  stepBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.primaryDark,
  },
});
