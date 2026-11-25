import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TripEstimateBannerProps {
  title?: string;
  durationText: string;
  originText: string;
  destinationText: string;
}

export const TripEstimateBanner: React.FC<TripEstimateBannerProps> = ({
  title = "Tiempo estimado de trayecto",
  durationText,
  originText,
  destinationText,
}) => {
  return (
    <View style={styles.estimateBanner}>
      <View style={styles.estimateHeader}>
        <View style={styles.titleContainer}>
          <Ionicons name="time-outline" size={17} color="#0284C7" />
          <Text style={styles.estimateTitle}>{title}:</Text>
        </View>
        <Text style={styles.estimateValue}>{durationText}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.routeContainer}>
        <View style={styles.routeRow}>
          <Ionicons name="business-outline" size={15} color="#64748B" />
          <Text style={styles.routeLabel}>Partida:</Text>
          <Text style={styles.routeValue} numberOfLines={1}>
            {originText}
          </Text>
        </View>
        <View style={styles.routeRow}>
          <Ionicons name="location" size={15} color="#DC2626" />
          <Text style={styles.routeLabel}>Llegada:</Text>
          <Text style={styles.routeValue} numberOfLines={1}>
            {destinationText}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TripEstimateBanner;

const styles = StyleSheet.create({
  estimateBanner: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  estimateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  estimateTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  estimateValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F294A",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 8,
  },
  routeContainer: {
    gap: 6,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    width: 52,
  },
  routeValue: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "500",
    flex: 1,
  },
});
