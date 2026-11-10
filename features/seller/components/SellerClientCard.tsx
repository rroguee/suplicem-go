import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/types/users";
import { Palette } from "@/constants/theme";

interface SellerClientCardProps {
  client: User;
  onPressNewOrder?: (client: User) => void;
}

export const SellerClientCard: React.FC<SellerClientCardProps> = ({
  client,
  onPressNewOrder,
}) => {
  const fullName = `${client.names || ""} ${client.lastNames || ""}`.trim() || "Cliente Sin Nombre";
  const isActive = client.status === "active";
  const address = client.addresses && client.addresses.length > 0 ? client.addresses[0].description : null;

  const handleCall = () => {
    if (client.phone) {
      Linking.openURL(`tel:${client.phone}`);
    }
  };

  const handleWhatsApp = () => {
    if (client.phone) {
      const clean = client.phone.replace(/[^0-9]/g, "");
      const wa = clean.startsWith("1") ? clean : `1${clean}`;
      Linking.openURL(`https://wa.me/${wa}`);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header: Avatar, Nombre y Estado */}
      <View style={styles.headerRow}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={20} color="#0F294A" />
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {fullName}
          </Text>
          <Text style={styles.emailText} numberOfLines={1}>
            {client.email}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            isActive ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isActive ? styles.activeText : styles.inactiveText,
            ]}
          >
            {isActive ? "Activo" : "Inactivo"}
          </Text>
        </View>
      </View>

      {/* Identificación, Teléfono y Contacto Rápido */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={15} color="#64748B" />
          <Text style={styles.detailText}>
            {client.identificationType || "Doc"}: {client.identification || "N/A"}
          </Text>
        </View>

        {client.phone ? (
          <View style={styles.phoneAndWaRow}>
            <TouchableOpacity
              style={styles.phoneBtn}
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={15} color="#0284C7" />
              <Text style={styles.phoneText}>
                {client.phone}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.waBadgeBtn}
              onPress={handleWhatsApp}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-whatsapp" size={13} color="#16A34A" />
              <Text style={styles.waBadgeText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {address ? (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={15} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {address}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Botón de Venta Asistida */}
      {onPressNewOrder && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onPressNewOrder(client)}
          activeOpacity={0.7}
        >
          <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Crear Pedido Asistido</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  nameContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F294A",
  },
  emailText: {
    fontSize: 12,
    color: "#64748B",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: "#DCFCE7",
  },
  inactiveBadge: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  activeText: {
    color: "#166534",
  },
  inactiveText: {
    color: "#991B1B",
  },
  detailsContainer: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  phoneAndWaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  phoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  phoneText: {
    fontSize: 13,
    color: "#0284C7",
    fontWeight: "600",
  },
  detailText: {
    fontSize: 13,
    color: "#334155",
    flex: 1,
  },
  linkText: {
    color: "#0284C7",
    fontWeight: "600",
  },
  waBadgeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  waBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: Palette.primary,
    borderRadius: 8,
    gap: 6,
    marginTop: 4,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
