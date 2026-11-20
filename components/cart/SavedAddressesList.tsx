import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { Address } from "@/types/users";
import { combineFullAddress } from "@/utils/addressFormatter";

interface SavedAddressesListProps {
  userAddresses: Address[];
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
}

export const SavedAddressesList: React.FC<SavedAddressesListProps> = ({
  userAddresses,
  selectedAddress,
  onSelectAddress,
}) => {
  return (
    <View style={styles.savedAddressesList}>
      {userAddresses.map((addr, index) => {
        const isSelected =
          selectedAddress?.description === addr.description &&
          selectedAddress?.placeId === addr.placeId;

        return (
          <TouchableOpacity
            key={addr.placeId || `saved-addr-${index}`}
            style={[
              styles.addressCard,
              isSelected && styles.addressCardSelected,
            ]}
            onPress={() => onSelectAddress(addr)}
            activeOpacity={0.7}
          >
            <View style={styles.addressCardLeft}>
              <Ionicons
                name={isSelected ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={isSelected ? Palette.primary : "#94A3B8"}
              />
            </View>
            <View style={styles.addressInfoContainer}>
              <View style={styles.addressTitleRow}>
                <Text
                  style={[
                    styles.addressDescription,
                    isSelected && styles.addressDescriptionSelected,
                  ]}
                  numberOfLines={2}
                >
                  {combineFullAddress(addr.description, addr.additionalInfo)}
                </Text>
                {index === 0 && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Principal</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default SavedAddressesList;

const styles = StyleSheet.create({
  savedAddressesList: {
    gap: 8,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  addressCardSelected: {
    borderColor: Palette.primary,
    backgroundColor: "#F0F7FF",
  },
  addressCardLeft: {
    marginTop: 2,
  },
  addressInfoContainer: {
    flex: 1,
  },
  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  addressDescription: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
  addressDescriptionSelected: {
    color: Palette.primary,
  },
  primaryBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    color: "#1D4ED8",
    fontWeight: "700",
  },
});
