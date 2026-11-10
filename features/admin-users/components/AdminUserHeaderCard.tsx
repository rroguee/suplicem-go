import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusBadge } from "@/components/StatusBadge";
import { Palette } from "@/constants/theme";

interface AdminUserHeaderCardProps {
  user: any;
}

export const AdminUserHeaderCard: React.FC<AdminUserHeaderCardProps> = ({ user }) => {
  const getInitials = () => {
    const n = user?.names?.[0] || "";
    const l = user?.lastNames?.[0] || "";
    return (n + l).toUpperCase() || "U";
  };

  const getRoleLabel = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "driver":
        return "Conductor";
      case "client":
        return "Cliente";
      case "seller":
        return "Vendedor";
      case "admin":
        return "Administrador";
      default:
        return role || "Usuario";
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>
          {user?.names} {user?.lastNames}
        </Text>
        <View style={styles.badgesRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{getRoleLabel(user?.userType)}</Text>
          </View>
          <StatusBadge status={user?.status} size="small" />
        </View>
        {user?.createdAt && (
          <Text style={styles.dateText}>
            Registrado: {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEF2F2",
    borderWidth: 2,
    borderColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    color: Palette.primary,
    fontSize: 22,
    fontWeight: "bold",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F294A",
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  dateText: {
    fontSize: 12,
    color: "#64748B",
  },
});
