import React, { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Option = {
  label: string;
  value: string;
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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectedText}>
          {options.find((opt) => opt.value === selectedValue)?.label || "Seleccionar"}
        </Text>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
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
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  selectedText: {
    fontSize: 16,
    color: "#000",
  },
  overlay: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    padding: 32,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  option: {
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#000",
  },
});
