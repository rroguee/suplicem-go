import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AddressSuggestionsListProps {
  results: any[];
  onSelectSuggestion: (item: any) => void;
}

export const AddressSuggestionsList: React.FC<AddressSuggestionsListProps> = ({
  results,
  onSelectSuggestion,
}) => {
  if (results.length === 0) return null;

  return (
    <ScrollView
      style={styles.resultsContainer}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      {results.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => onSelectSuggestion(item)}
          style={[styles.resultItem, item.isExact && styles.resultItemExact]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.isExact ? "checkmark-circle" : "pin-outline"}
            size={16}
            color={item.isExact ? "#16A34A" : "#E31E24"}
            style={styles.itemIcon}
          />
          <Text
            style={[styles.resultText, item.isExact && styles.resultTextExact]}
            numberOfLines={2}
          >
            {item.isExact ? `📌 Guardar esta dirección: "${item.description}"` : item.description}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default AddressSuggestionsList;

const styles = StyleSheet.create({
  resultsContainer: {
    maxHeight: 180,
    marginTop: 4,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderColor: "#CBD5E1",
    borderWidth: 1,
    elevation: 4,
    shadowColor: "#0F294A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomColor: "#F1F5F9",
    borderBottomWidth: 1,
  },
  resultItemExact: { backgroundColor: "#F0FDF4" },
  itemIcon: { marginRight: 8 },
  resultText: { fontSize: 13, color: "#334155", flex: 1, lineHeight: 18 },
  resultTextExact: { fontWeight: "bold", color: "#15803D" },
});
