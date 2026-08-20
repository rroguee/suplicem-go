import React from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";

const LoadingOverlay = ({ visible }: { visible: boolean }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#E31E24" />
      </View>
    </Modal>
  );
};

export default LoadingOverlay;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
