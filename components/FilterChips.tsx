import React from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Palette } from "@/constants/theme";

export interface FilterOption<T extends string = string> {
  id: T;
  label: string;
}

export interface FilterChipsProps<T extends string = string> {
  options: FilterOption<T>[];
  activeFilter: T;
  onSelectFilter: (filter: T) => void;
  counts?: Record<string, number>;
  activeColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function FilterChips<T extends string = string>({
  options,
  activeFilter,
  onSelectFilter,
  counts,
  activeColor = Palette.primary,
  style,
}: FilterChipsProps<T>) {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((opt) => {
          const isActive = activeFilter === opt.id;
          const count = counts ? counts[opt.id] : undefined;

          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.chip,
                isActive && {
                  backgroundColor: activeColor,
                  borderColor: activeColor,
                  elevation: 2,
                  shadowOpacity: 0.15,
                },
              ]}
              onPress={() => onSelectFilter(opt.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive && styles.chipTextActive,
                ]}
              >
                {opt.label}
              </Text>
              {typeof count === "number" && (
                <View
                  style={[
                    styles.badge,
                    isActive ? styles.badgeActive : styles.badgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      isActive
                        ? styles.badgeTextActive
                        : styles.badgeTextInactive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default FilterChips;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 2,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surface,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textDark,
    marginRight: 6,
  },
  chipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.28)",
  },
  badgeInactive: {
    backgroundColor: "#F1F5F9",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgeTextActive: {
    color: "#ffffff",
  },
  badgeTextInactive: {
    color: Palette.textMuted,
  },
});
