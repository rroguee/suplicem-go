import React, { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface SettingsMenuRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}

export const SettingsMenuRow: React.FC<SettingsMenuRowProps> = ({
  icon,
  iconColor,
  iconBgColor,
  title,
  subtitle,
  onPress,
  showChevron = true,
}) => {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconBox, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.menuTextBox}>
        <Text style={styles.menuRowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.menuRowSubtitle}>{subtitle}</Text> : null}
      </View>
      {showChevron ? (
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      ) : null}
    </TouchableOpacity>
  );
};

export interface SettingsMenuCardProps {
  title?: string;
  children: ReactNode;
}

export const SettingsMenuCard: React.FC<SettingsMenuCardProps> = ({
  title,
  children,
}) => {
  const childrenArray = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={styles.cardContainer}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.card}>
        {childrenArray.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < childrenArray.length - 1 ? <View style={styles.divider} /> : null}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTextBox: {
    flex: 1,
  },
  menuRowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  menuRowSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 66,
  },
});
