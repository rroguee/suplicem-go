import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Option = {
  label: string;
  value: string;
  isHeader?: boolean;
};

type Props = {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: Option[];
};

const CustomPickerModal: React.FC<Props> = ({
  label,
  selectedValue,
  onValueChange,
  options,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  const selectedLabel =
    options.find((opt) => opt.value === selectedValue)?.label || "Seleccionar";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.selectedText}>{selectedLabel}</Text>
        <Ionicons name="chevron-down" size={20} color="#E31E24" style={styles.chevronIcon} />
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            {/* Barrita superior indicadora de desplegable */}
            <View style={styles.modalHandleBar} />
            <Text style={styles.modalHeaderTitle}>{label}</Text>

            <FlatList
              data={options}
              keyExtractor={(item, index) => `${item.value}_${index}`}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                if (item.isHeader) {
                  return (
                    <View style={styles.headerOption}>
                      <Text style={styles.headerOptionText}>{item.label}</Text>
                    </View>
                  );
                }
                return (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      item.value === selectedValue && styles.optionSelected,
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        item.value === selectedValue && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.value === selectedValue && (
                      <Ionicons name="checkmark" size={18} color="#E31E24" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomPickerModal;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F294A",
    marginBottom: 6,
  },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  selectedText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
    flex: 1,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    padding: 24,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    maxHeight: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 12,
    textAlign: "center",
  },
  headerOption: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginVertical: 4,
  },
  headerOptionText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#475569",
    letterSpacing: 0.5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  optionSelected: {
    backgroundColor: "#fff8f8",
  },
  optionText: {
    fontSize: 15,
    color: "#333",
  },
  optionTextSelected: {
    fontWeight: "bold",
    color: "#E31E24",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
});
