import React, { useRef, useState, useEffect } from "react";
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
        iconChar: "!",
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
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.8));
  const timerRef = useRef<any>(null);

  const { backgroundColor, secondaryColor, iconChar } = getTypeStyles(type);

  const handleDismiss = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onPress) {
        onPress();
      }
      onClose();
    });
  };

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
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
          timerRef.current = setTimeout(() => {
            handleDismiss();
          }, duration);
        }
      });
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isVisible, duration]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.dismissOverlayTouch}
        onPress={handleDismiss}
      >
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
          <View style={styles.contentWrapper}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
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
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    zIndex: 9999,
  },
  dismissOverlayTouch: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  alertContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    maxWidth: "92%",
    minWidth: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  iconBackground: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconChar: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  contentWrapper: {
    flex: 1,
    paddingRight: 5,
  },
  messageText: {
    color: "white",
    fontSize: 15,
    flexShrink: 1,
    lineHeight: 21,
    fontWeight: "500",
  },
});

export default CustomAlert;
