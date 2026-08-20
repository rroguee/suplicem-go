import React, { useRef, useEffect } from "react";
import {
  Animated,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { AlertType } from "../types/alert";

interface CustomAlertProps {
  message: string;
  type?: AlertType;
  duration?: number;
  onPress?: () => void;
  isVisible: boolean;
  onClose: () => void;
}


const getTypeStyles = (type: AlertType | undefined) => {
  switch (type) {
    case "success":
      return {
        backgroundColor: "#4CAF50",
        secondaryColor: "#388E3C", 
        iconChar: "✓",
      };
    case "error":
      return {
        backgroundColor: "#F44336",
        secondaryColor: "#D32F2F", 
        iconChar: "✕",
      };
    case "info":
      return {
        backgroundColor: "#2196F3",
        secondaryColor: "#1976D2", 
        iconChar: "i",
      };
    case "warning":
      return {
        backgroundColor: "#FFC107", 
        secondaryColor: "#FFA000", 
      };
    default:
      return {
        backgroundColor: "#607D8B", 
        secondaryColor: "#455A64",
        iconChar: "i",
      };
  }
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  message,
  type,
  duration = 2500, 
  onPress,
  isVisible,
  onClose,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const scaleAnim = useRef(new Animated.Value(0.8)).current; 

  let timer: number;

  const { backgroundColor, secondaryColor, iconChar } = getTypeStyles(type);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300, 
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6, 
          tension: 80, 
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (duration > 0) {
          timer = setTimeout(() => {
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start(() => onClose());
          }, duration);
        }
      });
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }

    return () => clearTimeout(timer);
  }, [isVisible, duration]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.alertContainer,
          { backgroundColor }, 
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View
          style={[styles.iconBackground, { backgroundColor: secondaryColor }]}
        >
          <Text style={styles.iconChar}>{iconChar}</Text>
        </View>
        <TouchableOpacity
          onPress={onPress || onClose}
          style={styles.contentWrapper}
          activeOpacity={0.8}
        >
          <Text style={styles.messageText}>{message}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    paddingHorizontal: 20,
  },
  alertContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16, 
    borderRadius: 15, 
    maxWidth: "90%",
    minWidth: "70%", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.35, 
    shadowRadius: 10, 
    elevation: 12, 
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20, 
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15, 
  },
  iconChar: {
    fontSize: 22, 
    color: "white",
    fontWeight: "bold",
  },
  contentWrapper: {
    flex: 1,
    paddingRight: 5, 
  },
  messageText: {
    color: "white",
    fontSize: 16, 
    flexShrink: 1,
    lineHeight: 22, 
    fontWeight: "500", 
  },
});

export default CustomAlert;
